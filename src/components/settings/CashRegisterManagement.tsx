
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, CreditCard } from "lucide-react";
import { CashRegister } from "@/lib/types";
import CashRegisterForm from "./CashRegisterForm";

interface CashRegisterManagementProps {
  siteId: string;
}

const CashRegisterManagement: React.FC<CashRegisterManagementProps> = ({ siteId }) => {
  // Mock data for initial cash registers with correct status types
  const initialCashRegisters: CashRegister[] = [
    {
      id: "reg-1",
      name: "Caisse principale",
      siteId,
      initialAmount: 100,
      currentAmount: 350.75,
      lastReconciled: "2025-05-04T15:30:00",
      status: "open" as const
    },
    {
      id: "reg-2",
      name: "Caisse secondaire",
      siteId,
      initialAmount: 50,
      currentAmount: 120.25,
      lastReconciled: "2025-05-03T18:45:00",
      status: "closed" as const
    }
  ];

  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>(initialCashRegisters);
  const [isAddingRegister, setIsAddingRegister] = useState(false);
  const [editingRegister, setEditingRegister] = useState<CashRegister | null>(null);
  const { toast } = useToast();

  const handleAddRegister = (newRegister: CashRegister) => {
    setCashRegisters([...cashRegisters, newRegister]);
    setIsAddingRegister(false);
    toast({
      title: "Caisse ajoutée",
      description: `La caisse "${newRegister.name}" a été ajoutée avec succès.`
    });
  };

  const handleUpdateRegister = (updatedRegister: CashRegister) => {
    setCashRegisters(cashRegisters.map(reg => 
      reg.id === updatedRegister.id ? updatedRegister : reg
    ));
    setEditingRegister(null);
    toast({
      title: "Caisse mise à jour",
      description: `La caisse "${updatedRegister.name}" a été mise à jour avec succès.`
    });
  };

  const handleDeleteRegister = (registerId: string) => {
    setCashRegisters(cashRegisters.filter(reg => reg.id !== registerId));
    toast({
      title: "Caisse supprimée",
      description: "La caisse a été supprimée avec succès."
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Jamais";
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs";
      case "closed":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs";
      case "reconciling":
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Ouverte";
      case "closed":
        return "Fermée";
      case "reconciling":
        return "En rapprochement";
      default:
        return status;
    }
  };

  if (isAddingRegister) {
    return (
      <CashRegisterForm 
        siteId={siteId} 
        onSave={handleAddRegister} 
        onCancel={() => setIsAddingRegister(false)} 
      />
    );
  }

  if (editingRegister) {
    return (
      <CashRegisterForm 
        register={editingRegister}
        siteId={siteId}
        onSave={handleUpdateRegister} 
        onCancel={() => setEditingRegister(null)} 
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Caisses enregistreuses</CardTitle>
          <CardDescription>
            Gérez les caisses pour ce site
          </CardDescription>
        </div>
        <Button onClick={() => setIsAddingRegister(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une caisse
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Montant initial</TableHead>
              <TableHead>Montant actuel</TableHead>
              <TableHead>Dernier rapprochement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cashRegisters.map(register => (
              <TableRow key={register.id}>
                <TableCell className="font-medium">{register.name}</TableCell>
                <TableCell>{formatCurrency(register.initialAmount)}</TableCell>
                <TableCell>{formatCurrency(register.currentAmount)}</TableCell>
                <TableCell>{formatDate(register.lastReconciled)}</TableCell>
                <TableCell>
                  <span className={getStatusBadgeClass(register.status)}>
                    {getStatusLabel(register.status)}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditingRegister(register)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteRegister(register.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {cashRegisters.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <CreditCard className="h-10 w-10 text-gray-400" />
                    <p>Aucune caisse enregistreuse trouvée</p>
                    <Button variant="outline" onClick={() => setIsAddingRegister(true)}>
                      Ajouter une caisse
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CashRegisterManagement;
