import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { z } from 'zod';

// Validation schemas
const clientSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  email: z.string().email('Email invalide').max(255),
  phone: z.string().max(20),
  address: z.string().max(500).optional(),
});

const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  reference: z.string().max(50).optional(),
  price: z.number().positive('Le prix doit être positif'),
  stock: z.number().int().nonnegative('Le stock doit être positif ou nul').optional(),
  description: z.string().max(1000).optional(),
});

const supplierSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  email: z.string().email('Email invalide').max(255).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
});

type ImportType = 'clients' | 'products' | 'suppliers';

interface ValidationResult {
  valid: number;
  errors: Array<{ row: number; errors: string[] }>;
  data: any[];
}

export function ImportData() {
  const [importType, setImportType] = useState<ImportType>('clients');
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const getSchema = (type: ImportType) => {
    switch (type) {
      case 'clients': return clientSchema;
      case 'products': return productSchema;
      case 'suppliers': return supplierSchema;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationResult(null);
    }
  };

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error),
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
      } else {
        reject(new Error('Format de fichier non supporté'));
      }
    });
  };

  const validateData = async () => {
    if (!file) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un fichier',
        variant: 'destructive',
      });
      return;
    }

    try {
      const parsedData = await parseFile(file);
      const schema = getSchema(importType);
      const validData: any[] = [];
      const errors: Array<{ row: number; errors: string[] }> = [];

      parsedData.forEach((row: any, index: number) => {
        // Convert string numbers to actual numbers for product prices/stock
        if (importType === 'products') {
          if (row.price) row.price = parseFloat(row.price);
          if (row.stock) row.stock = parseInt(row.stock, 10);
        }

        const result = schema.safeParse(row);
        if (result.success) {
          validData.push(result.data);
        } else {
          errors.push({
            row: index + 2, // +2 because index starts at 0 and row 1 is header
            errors: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`),
          });
        }
      });

      setValidationResult({
        valid: validData.length,
        errors,
        data: validData,
      });

      toast({
        title: 'Validation terminée',
        description: `${validData.length} lignes valides, ${errors.length} erreurs`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de la lecture du fichier',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!validationResult || validationResult.data.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Aucune donnée valide à importer',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    try {
      const API_URL = 'http://localhost:3001/api';
      const endpoint = importType;

      // Import data in batches
      for (const item of validationResult.data) {
        await fetch(`${API_URL}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }

      toast({
        title: 'Import réussi',
        description: `${validationResult.data.length} enregistrements importés avec succès`,
      });

      // Reset
      setFile(null);
      setValidationResult(null);
      if (document.getElementById('file-upload') as HTMLInputElement) {
        (document.getElementById('file-upload') as HTMLInputElement).value = '';
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'import des données',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const templates = {
      clients: [
        { name: 'Client Example', email: 'client@example.com', phone: '0123456789', address: '123 Rue Example' }
      ],
      products: [
        { name: 'Product Example', reference: 'PROD001', price: 99.99, stock: 100, description: 'Description example' }
      ],
      suppliers: [
        { name: 'Supplier Example', email: 'supplier@example.com', phone: '0123456789', address: '456 Avenue Example' }
      ],
    };

    const data = templates[importType];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `template_${importType}.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import de Données
        </CardTitle>
        <CardDescription>
          Importez vos données en masse depuis Excel ou CSV
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Type de données</label>
          <Select value={importType} onValueChange={(value) => setImportType(value as ImportType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="products">Produits</SelectItem>
              <SelectItem value="suppliers">Fournisseurs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Télécharger Template
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Fichier (.csv, .xlsx, .xls)</label>
          <input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>

        {file && (
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription>
              Fichier sélectionné: {file.name}
            </AlertDescription>
          </Alert>
        )}

        {validationResult && (
          <div className="space-y-2">
            <Alert variant={validationResult.errors.length > 0 ? 'destructive' : 'default'}>
              {validationResult.errors.length > 0 ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription>
                <strong>{validationResult.valid} lignes valides</strong>
                {validationResult.errors.length > 0 && `, ${validationResult.errors.length} erreurs`}
              </AlertDescription>
            </Alert>

            {validationResult.errors.length > 0 && (
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                <p className="text-sm font-medium">Erreurs de validation:</p>
                {validationResult.errors.slice(0, 10).map((error, idx) => (
                  <div key={idx} className="text-sm text-destructive">
                    Ligne {error.row}: {error.errors.join(', ')}
                  </div>
                ))}
                {validationResult.errors.length > 10 && (
                  <p className="text-sm text-muted-foreground">
                    ... et {validationResult.errors.length - 10} autres erreurs
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={validateData} disabled={!file}>
            Valider les données
          </Button>
          <Button
            onClick={handleImport}
            disabled={!validationResult || validationResult.data.length === 0 || importing}
          >
            {importing ? 'Import en cours...' : 'Importer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
