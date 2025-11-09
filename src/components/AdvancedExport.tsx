import React, { useState } from 'react';
import { Download, Filter, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type DataType = 'clients' | 'products' | 'invoices' | 'suppliers';
type ExportFormat = 'excel' | 'csv' | 'pdf';

const dataTypeFields = {
  clients: ['name', 'email', 'phone', 'address', 'code'],
  products: ['reference', 'description', 'price', 'stock'],
  invoices: ['number', 'date', 'client', 'total', 'status'],
  suppliers: ['name', 'email', 'phone', 'address', 'code'],
};

export function AdvancedExport() {
  const [dataType, setDataType] = useState<DataType>('clients');
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { toast } = useToast();

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner au moins un champ',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Fetch data from API (mock for now)
      const API_URL = 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/${dataType}`);
      let data = await response.json();

      // Apply date filter if applicable
      if (dateRange?.from && dateRange?.to && (dataType === 'invoices' || dataType === 'clients')) {
        data = data.filter((item: any) => {
          const itemDate = new Date(item.date || item.createdAt);
          return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
        });
      }

      // Filter fields
      const filteredData = data.map((item: any) => {
        const filtered: any = {};
        selectedFields.forEach((field) => {
          if (field === 'client' && item.client) {
            filtered[field] = item.client?.name || '-';
          } else {
            filtered[field] = item[field];
          }
        });
        return filtered;
      });

      // Export based on format
      if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, dataType);
        XLSX.writeFile(wb, `export_${dataType}_${Date.now()}.xlsx`);
      } else if (format === 'csv') {
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `export_${dataType}_${Date.now()}.csv`;
        link.click();
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text(`Export ${dataType}`, 14, 20);
        
        const headers = [selectedFields];
        const rows = filteredData.map((item: any) =>
          selectedFields.map((field) => String(item[field] || ''))
        );

        autoTable(doc, {
          head: headers,
          body: rows,
          startY: 30,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] },
        });

        doc.save(`export_${dataType}_${Date.now()}.pdf`);
      }

      toast({
        title: 'Export réussi',
        description: `Les données ont été exportées en ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'export des données',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Avancé de Données
        </CardTitle>
        <CardDescription>
          Exportez vos données avec filtres et colonnes personnalisables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type de données</Label>
            <Select value={dataType} onValueChange={(value) => setDataType(value as DataType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clients">Clients</SelectItem>
                <SelectItem value="products">Produits</SelectItem>
                <SelectItem value="invoices">Factures</SelectItem>
                <SelectItem value="suppliers">Fournisseurs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format d'export</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Champs à exporter
          </Label>
          <div className="border rounded-md p-4 space-y-2">
            {dataTypeFields[dataType].map((field) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={field}
                  checked={selectedFields.includes(field)}
                  onCheckedChange={() => toggleField(field)}
                />
                <label
                  htmlFor={field}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {field}
                </label>
              </div>
            ))}
          </div>
        </div>

        {(dataType === 'invoices' || dataType === 'clients') && (
          <div className="space-y-2">
            <Label>Filtre par date</Label>
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
            />
          </div>
        )}

        <Button onClick={handleExport} className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Exporter ({selectedFields.length} champs)
        </Button>
      </CardContent>
    </Card>
  );
}
