
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
    isMainSite: site?.isMainSite || false
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
