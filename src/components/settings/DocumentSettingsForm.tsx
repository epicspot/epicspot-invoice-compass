import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

const DocumentSettingsForm = () => {
  const { companyInfo, saveCompanyInfo } = useCompanyInfo();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [invoicePrefix, setInvoicePrefix] = useState('FACT');
  const [quotePrefix, setQuotePrefix] = useState('DEVIS');
  const [logoPreview, setLogoPreview] = useState(companyInfo.logo || '');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        saveCompanyInfo({ logo: base64 });
        toast({
          title: "Logo importé",
          description: "Le logo a été importé avec succès.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    saveCompanyInfo({ logo: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Logo supprimé",
      description: "Le logo a été supprimé.",
    });
  };

  const handleSaveFormats = () => {
    // Store formats in localStorage for now
    localStorage.setItem('invoicePrefix', invoicePrefix);
    localStorage.setItem('quotePrefix', quotePrefix);
    
    toast({
      title: "Formats enregistrés",
      description: "Les formats de numérotation ont été enregistrés.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logo de l'entreprise</CardTitle>
          <CardDescription>
            Importez le logo qui apparaîtra sur vos factures et devis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logoPreview ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img 
                  src={logoPreview} 
                  alt="Logo" 
                  className="h-24 w-auto border rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={handleRemoveLogo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Sélectionner un fichier
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                PNG, JPG ou SVG (max. 2MB)
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formats de numérotation</CardTitle>
          <CardDescription>
            Définissez les préfixes pour vos factures et devis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice-prefix">Préfixe des factures</Label>
            <Input
              id="invoice-prefix"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              placeholder="FACT"
            />
            <p className="text-sm text-muted-foreground">
              Exemple: {invoicePrefix}-001, {invoicePrefix}-002, etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote-prefix">Préfixe des devis</Label>
            <Input
              id="quote-prefix"
              value={quotePrefix}
              onChange={(e) => setQuotePrefix(e.target.value)}
              placeholder="DEVIS"
            />
            <p className="text-sm text-muted-foreground">
              Exemple: {quotePrefix}-001, {quotePrefix}-002, etc.
            </p>
          </div>

          <Button onClick={handleSaveFormats}>
            Enregistrer les formats
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentSettingsForm;
