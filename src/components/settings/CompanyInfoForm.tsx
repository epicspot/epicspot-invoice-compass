
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";
import { companyInfoSchema, type CompanyInfoFormData } from "@/lib/validation/companySchema";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useValidationAlert } from "@/hooks/useValidationAlert";


const CompanyInfoForm = () => {
  const { companyInfo, loading, saveCompanyInfo } = useCompanyInfo();
  const { logAction } = useAuditLog();
  const { recordFailure } = useValidationAlert();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CompanyInfoFormData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: companyInfo,
  });

  useEffect(() => {
    reset(companyInfo);
  }, [companyInfo, reset]);

  const onSubmit = async (data: CompanyInfoFormData) => {
    await saveCompanyInfo(data);
  };

  const onError = async (errors: any) => {
    const errorMessages = Object.entries(errors).map(([field, error]: [string, any]) => ({
      field,
      message: error.message
    }));
    
    // Log audit
    await logAction(
      'UPDATE',
      'company_info',
      'company_info',
      undefined,
      { validation_errors: errorMessages },
      `Échec de validation lors de la modification des informations du siège: ${errorMessages.length} erreur(s)`
    );

    // Record failure for alert system
    await recordFailure('Informations du siège', errorMessages.length);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }


  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
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
              <Label htmlFor="name">Nom de l'entreprise *</Label>
              <Input 
                id="name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input 
                id="address"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input 
                id="phone"
                {...register('phone')}
                placeholder="+225 XX XX XX XX"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                {...register('email')}
                placeholder="contact@entreprise.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input 
                id="website"
                {...register('website')}
                placeholder="https://www.entreprise.com"
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxId">Numéro de TVA / RC</Label>
              <Input 
                id="taxId"
                {...register('taxId')}
                placeholder="RC: XXXXXXX - IF: XXXXXXX"
              />
              {errors.taxId && (
                <p className="text-sm text-destructive">{errors.taxId.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signatory">Signataire</Label>
              <Input 
                id="signatory"
                {...register('signatory')}
                placeholder="Nom du signataire"
              />
              {errors.signatory && (
                <p className="text-sm text-destructive">{errors.signatory.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signatoryTitle">Titre du signataire</Label>
              <Input 
                id="signatoryTitle"
                {...register('signatoryTitle')}
                placeholder="Ex: Directeur Général"
              />
              {errors.signatoryTitle && (
                <p className="text-sm text-destructive">{errors.signatoryTitle.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankName">Nom de la banque</Label>
              <Input 
                id="bankName"
                {...register('bankName')}
                placeholder="Nom de la banque"
              />
              {errors.bankName && (
                <p className="text-sm text-destructive">{errors.bankName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Numéro de compte bancaire</Label>
              <Input 
                id="bankAccount"
                {...register('bankAccount')}
                placeholder="Numéro de compte"
              />
              {errors.bankAccount && (
                <p className="text-sm text-destructive">{errors.bankAccount.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankIBAN">IBAN</Label>
              <Input 
                id="bankIBAN"
                {...register('bankIBAN')}
                placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
              />
              {errors.bankIBAN && (
                <p className="text-sm text-destructive">{errors.bankIBAN.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankSwift">Code SWIFT/BIC</Label>
              <Input 
                id="bankSwift"
                {...register('bankSwift')}
                placeholder="BNPAFRPPXXX"
                maxLength={11}
              />
              {errors.bankSwift && (
                <p className="text-sm text-destructive">{errors.bankSwift.message}</p>
              )}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="slogan">Slogan de l'entreprise</Label>
              <Input 
                id="slogan"
                {...register('slogan')}
                placeholder="Ex: Votre partenaire de confiance"
              />
              {errors.slogan && (
                <p className="text-sm text-destructive">{errors.slogan.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default CompanyInfoForm;

