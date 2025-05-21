
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

interface NewRegisterCardProps {
  onClick: () => void;
}

const NewRegisterCard: React.FC<NewRegisterCardProps> = ({ onClick }) => {
  return (
    <Card 
      className="flex flex-col items-center justify-center h-full min-h-[200px] border-dashed cursor-pointer hover:border-gray-400 transition-colors"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center h-full py-6">
        <PlusCircle className="h-12 w-12 text-gray-400 mb-2" />
        <p className="font-medium text-lg">Ajouter une caisse</p>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Configurez une nouvelle caisse enregistreuse
        </p>
      </CardContent>
    </Card>
  );
};

export default NewRegisterCard;
