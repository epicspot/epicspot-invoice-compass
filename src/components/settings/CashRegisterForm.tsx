
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CashRegister } from "@/lib/types";

interface CashRegisterFormProps {
  register?: CashRegister;
  siteId: string;
  onSave: (register: CashRegister) => void;
  onCancel: () => void;
}

const CashRegisterForm: React.FC<CashRegisterFormProps> = ({ 
  register, 
  siteId, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<Omit<CashRegister, "id">>({
    name: register?.name || "",
    siteId: siteId,
    initialAmount: register?.initialAmount || 0,
    currentAmount: register?.currentAmount || 0,
    lastReconciled: register?.lastReconciled,
    status: register?.status || "closed"
  });

  const handleChange = (
    field: keyof typeof formData, 
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberChange = (field: "initialAmount" | "currentAmount", value: string) => {
    const numValue = parseFloat(value) || 0;
    handleChange(field, numValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRegister: CashRegister = {
      id: register?.id || `reg-${Date.now()}`,
      ...formData
    };

    onSave(newRegister);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {register ? "Modifier la caisse" : "Ajouter une caisse"}
          </CardTitle>
          <CardDescription>
            {register 
              ? "Modifiez les informations de la caisse" 
              : "Entrez les informations de la nouvelle caisse"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la caisse</Label>
            <Input
              id="name"
              placeholder="Caisse principale, Caisse secondaire, etc."
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initialAmount">Montant initial (FCFA)</Label>
              <Input
                id="initialAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="100.00"
                value={formData.initialAmount}
                onChange={(e) => handleNumberChange("initialAmount", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentAmount">Montant actuel (FCFA)</Label>
              <Input
                id="currentAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="100.00"
                value={formData.currentAmount}
                onChange={(e) => handleNumberChange("currentAmount", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Ouverte</SelectItem>
                <SelectItem value="closed">Fermée</SelectItem>
                <SelectItem value="reconciling">En rapprochement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {register ? "Mettre à jour" : "Ajouter"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CashRegisterForm;
