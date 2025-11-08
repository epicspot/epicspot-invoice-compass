
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";

const CompanyInfoForm = () => {
  const { companyInfo, loading, saveCompanyInfo } = useCompanyInfo();
  const [formData, setFormData] = React.useState(companyInfo);

  React.useEffect(() => {
    setFormData(companyInfo);
  }, [companyInfo]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    saveCompanyInfo(formData);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de l'entreprise</CardTitle>
        <CardDescription>
          Ces informations apparaîtront sur vos devis et factures.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom de l'entreprise</label>
            <Input 
              value={formData.name} 
              onChange={(e) => handleChange('name', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Adresse</label>
            <Input 
              value={formData.address} 
              onChange={(e) => handleChange('address', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Téléphone</label>
            <Input 
              value={formData.phone || ''} 
              onChange={(e) => handleChange('phone', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              value={formData.email || ''} 
              onChange={(e) => handleChange('email', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Site web</label>
            <Input 
              value={formData.website || ''} 
              onChange={(e) => handleChange('website', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Numéro de TVA / RC</label>
            <Input 
              value={formData.taxId || ''} 
              onChange={(e) => handleChange('taxId', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Signataire</label>
            <Input 
              value={formData.signatory || ''} 
              onChange={(e) => handleChange('signatory', e.target.value)} 
              placeholder="Nom du signataire"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Titre du signataire</label>
            <Input 
              value={formData.signatoryTitle || ''} 
              onChange={(e) => handleChange('signatoryTitle', e.target.value)} 
              placeholder="Ex: Directeur Général"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom de la banque</label>
            <Input 
              value={formData.bankName || ''} 
              onChange={(e) => handleChange('bankName', e.target.value)} 
              placeholder="Nom de la banque"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Numéro de compte bancaire</label>
            <Input 
              value={formData.bankAccount || ''} 
              onChange={(e) => handleChange('bankAccount', e.target.value)} 
              placeholder="Numéro de compte"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">IBAN</label>
            <Input 
              value={formData.bankIBAN || ''} 
              onChange={(e) => handleChange('bankIBAN', e.target.value)} 
              placeholder="Code IBAN"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Code SWIFT/BIC</label>
            <Input 
              value={formData.bankSwift || ''} 
              onChange={(e) => handleChange('bankSwift', e.target.value)} 
              placeholder="Code SWIFT/BIC"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Slogan de l'entreprise</label>
            <Input 
              value={formData.slogan || ''} 
              onChange={(e) => handleChange('slogan', e.target.value)} 
              placeholder="Ex: Votre partenaire de confiance"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Enregistrer</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoForm;

