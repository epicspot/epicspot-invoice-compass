
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CompanyInfo } from "@/lib/types";

interface CompanyInfoFormProps {
  initialCompanyInfo: CompanyInfo;
}

const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({ initialCompanyInfo }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const { toast } = useToast();

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCompanyInfo = () => {
    // Here you would save to backend
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
            <label className="text-sm font-medium">Numéro de TVA</label>
            <Input 
              value={companyInfo.taxId || ''} 
              onChange={(e) => handleCompanyInfoChange('taxId', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Coordonnées bancaires</label>
            <Input 
              value={companyInfo.bankAccount || ''} 
              onChange={(e) => handleCompanyInfoChange('bankAccount', e.target.value)} 
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
