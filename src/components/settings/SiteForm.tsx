
import React, { useState } from "react";
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

interface SiteFormProps {
  site?: Site;
  onSave: (site: Site) => void;
  onCancel: () => void;
}

const SiteForm: React.FC<SiteFormProps> = ({ site, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Site, "id" | "cashRegisters">>({
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
  });

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSite: Site = {
      id: site?.id || `site-${Date.now()}`,
      ...formData
    };

    onSave(newSite);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{site ? "Modifier le site" : "Ajouter un site"}</CardTitle>
          <CardDescription>
            {site ? "Modifiez les informations du site" : "Entrez les informations du nouveau site"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du site</Label>
            <Input
              id="name"
              placeholder="Siège social, Succursale Lyon, etc."
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              placeholder="123 rue Example, Ville 75000"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                placeholder="+33 1 23 45 67 89"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="contact@site.com"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
            <Switch
              id="useHeadquartersInfo"
              checked={formData.useHeadquartersInfo ?? true}
              onCheckedChange={(checked) => handleChange("useHeadquartersInfo", checked)}
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

          {!formData.useHeadquartersInfo && (
            <>
              <div className="space-y-2">
                <Label htmlFor="taxId">Numéro de TVA / RC</Label>
                <Input
                  id="taxId"
                  placeholder="RC: XXXXXXX - IF: XXXXXXX"
                  value={formData.taxId}
                  onChange={(e) => handleChange("taxId", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Nom de la banque</Label>
                  <Input
                    id="bankName"
                    placeholder="Nom de la banque"
                    value={formData.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Numéro de compte</Label>
                  <Input
                    id="bankAccount"
                    placeholder="Numéro de compte"
                    value={formData.bankAccount}
                    onChange={(e) => handleChange("bankAccount", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankIBAN">IBAN</Label>
                  <Input
                    id="bankIBAN"
                    placeholder="Code IBAN"
                    value={formData.bankIBAN}
                    onChange={(e) => handleChange("bankIBAN", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankSwift">Code SWIFT/BIC</Label>
                  <Input
                    id="bankSwift"
                    placeholder="Code SWIFT/BIC"
                    value={formData.bankSwift}
                    onChange={(e) => handleChange("bankSwift", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isMainSite"
              checked={formData.isMainSite}
              onCheckedChange={(checked) => handleChange("isMainSite", checked)}
              disabled={site?.isMainSite}
            />
            <Label htmlFor="isMainSite">Site principal</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {site ? "Mettre à jour" : "Ajouter"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default SiteForm;
