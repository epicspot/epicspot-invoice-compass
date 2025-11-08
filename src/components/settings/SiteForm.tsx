
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Site } from "@/lib/types";
import { siteSchema, type SiteFormData } from "@/lib/validation/companySchema";

interface SiteFormProps {
  site?: Site;
  onSave: (site: Site) => void;
  onCancel: () => void;
}

const SiteForm: React.FC<SiteFormProps> = ({ site, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: site?.name || "",
      address: site?.address || "",
      phone: site?.phone || "",
      email: site?.email || "",
      isMainSite: site?.isMainSite || false,
      useHeadquartersInfo: site?.useHeadquartersInfo ?? true,
      taxId: site?.taxId || "",
      bankAccount: site?.bankAccount || "",
      bankName: site?.bankName || "",
      bankIBAN: site?.bankIBAN || "",
      bankSwift: site?.bankSwift || ""
    }
  });

  const useHeadquartersInfo = watch("useHeadquartersInfo");

  const onSubmit = (data: SiteFormData) => {
    const newSite: Site = {
      id: site?.id || `site-${Date.now()}`,
      ...data
    };
    onSave(newSite);
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{site ? "Modifier le site" : "Ajouter un site"}</CardTitle>
          <CardDescription>
            {site ? "Modifiez les informations du site" : "Entrez les informations du nouveau site"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du site *</Label>
            <Input
              id="name"
              placeholder="Siège social, Succursale Lyon, etc."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              placeholder="123 rue Example, Ville 75000"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                placeholder="+33 1 23 45 67 89"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="contact@site.com"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
            <Switch
              id="useHeadquartersInfo"
              {...register("useHeadquartersInfo")}
            />
            <div className="flex-1">
              <Label htmlFor="useHeadquartersInfo" className="cursor-pointer">
                Synchroniser avec le siège
              </Label>
              <p className="text-sm text-muted-foreground">
                Utiliser automatiquement les informations fiscales et bancaires du siège
              </p>
            </div>
          </div>

          {!useHeadquartersInfo && (
            <>
              <div className="space-y-2">
                <Label htmlFor="taxId">Numéro de TVA / RC</Label>
                <Input
                  id="taxId"
                  placeholder="RC: XXXXXXX - IF: XXXXXXX"
                  {...register("taxId")}
                />
                {errors.taxId && (
                  <p className="text-sm text-destructive">{errors.taxId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Nom de la banque</Label>
                  <Input
                    id="bankName"
                    placeholder="Nom de la banque"
                    {...register("bankName")}
                  />
                  {errors.bankName && (
                    <p className="text-sm text-destructive">{errors.bankName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Numéro de compte</Label>
                  <Input
                    id="bankAccount"
                    placeholder="Numéro de compte"
                    {...register("bankAccount")}
                  />
                  {errors.bankAccount && (
                    <p className="text-sm text-destructive">{errors.bankAccount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankIBAN">IBAN</Label>
                  <Input
                    id="bankIBAN"
                    placeholder="FR76 XXXX XXXX"
                    {...register("bankIBAN")}
                  />
                  {errors.bankIBAN && (
                    <p className="text-sm text-destructive">{errors.bankIBAN.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankSwift">Code SWIFT/BIC</Label>
                  <Input
                    id="bankSwift"
                    placeholder="BNPAFRPPXXX"
                    maxLength={11}
                    {...register("bankSwift")}
                  />
                  {errors.bankSwift && (
                    <p className="text-sm text-destructive">{errors.bankSwift.message}</p>
                  )}
                </div>
              </div>
            </>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isMainSite"
              {...register("isMainSite")}
              disabled={site?.isMainSite}
            />
            <Label htmlFor="isMainSite">Site principal</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : (site ? "Mettre à jour" : "Ajouter")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default SiteForm;
