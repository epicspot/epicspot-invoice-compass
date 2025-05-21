
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, ArrowUpDown } from "lucide-react";

const RegisterOperations: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Opérations de caisse</CardTitle>
        <CardDescription>
          Effectuez des opérations manuelles sur la caisse
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button className="h-24" variant="outline">
            <div className="flex flex-col items-center">
              <Banknote className="h-8 w-8 mb-2" />
              <span>Dépôt d'espèces</span>
            </div>
          </Button>
          <Button className="h-24" variant="outline">
            <div className="flex flex-col items-center">
              <Banknote className="h-8 w-8 mb-2" />
              <span>Retrait d'espèces</span>
            </div>
          </Button>
        </div>
        <Button className="w-full h-16" variant="outline">
          <div className="flex flex-col items-center">
            <ArrowUpDown className="h-6 w-6 mb-1" />
            <span>Ajustement de caisse</span>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default RegisterOperations;
