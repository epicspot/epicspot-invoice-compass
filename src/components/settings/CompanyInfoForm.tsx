
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";

const CompanyInfoForm = () => {
  const { companyInfo, updateCompanyInfo } = useCompanyInfo();
  const { toast } = useToast();

  const handleCompanyInfoChange = (field: string, value: string) => {
    updateCompanyInfo({ [field]: value });
  };

  const handleSaveCompanyInfo = () => {
    toast({
      title: "Informations sauvegardées",
      description: "Les informations de l'entreprise ont été mises à jour avec succès."
    });
  };

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
              value={companyInfo.name} 
              onChange={(e) => handleCompanyInfoChange('name', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Adresse</label>
            <Input 
              value={companyInfo.address} 
              onChange={(e) => handleCompanyInfoChange('address', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Téléphone</label>
            <Input 
              value={companyInfo.phone || ''} 
              onChange={(e) => handleCompanyInfoChange('phone', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              value={companyInfo.email || ''} 
              onChange={(e) => handleCompanyInfoChange('email', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Site web</label>
            <Input 
              value={companyInfo.website || ''} 
              onChange={(e) => handleCompanyInfoChange('website', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Numéro de TVA / RC</label>
            <Input 
              value={companyInfo.taxId || ''} 
              onChange={(e) => handleCompanyInfoChange('taxId', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Signataire</label>
            <Input 
              value={companyInfo.signatory || ''} 
              onChange={(e) => handleCompanyInfoChange('signatory', e.target.value)} 
              placeholder="Nom du signataire"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Titre du signataire</label>
            <Input 
              value={companyInfo.signatoryTitle || ''} 
              onChange={(e) => handleCompanyInfoChange('signatoryTitle', e.target.value)} 
              placeholder="Ex: Directeur Général"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom de la banque</label>
            <Input 
              value={companyInfo.bankName || ''} 
              onChange={(e) => handleCompanyInfoChange('bankName', e.target.value)} 
              placeholder="Nom de la banque"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Numéro de compte bancaire</label>
            <Input 
              value={companyInfo.bankAccount || ''} 
              onChange={(e) => handleCompanyInfoChange('bankAccount', e.target.value)} 
              placeholder="Numéro de compte"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">IBAN</label>
            <Input 
              value={companyInfo.bankIBAN || ''} 
              onChange={(e) => handleCompanyInfoChange('bankIBAN', e.target.value)} 
              placeholder="Code IBAN"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Code SWIFT/BIC</label>
            <Input 
              value={companyInfo.bankSwift || ''} 
              onChange={(e) => handleCompanyInfoChange('bankSwift', e.target.value)} 
              placeholder="Code SWIFT/BIC"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Slogan de l'entreprise</label>
            <Input 
              value={companyInfo.slogan || ''} 
              onChange={(e) => handleCompanyInfoChange('slogan', e.target.value)} 
              placeholder="Ex: Votre partenaire de confiance"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSaveCompanyInfo}>Enregistrer</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoForm;

