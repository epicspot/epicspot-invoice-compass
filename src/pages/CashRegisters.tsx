import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCashRegisters } from "@/hooks/useCashRegisters";
import RegisterDetails from "@/components/cash-register/RegisterDetails";
import RegisterCard from "@/components/cash-register/RegisterCard";
import NewRegisterCard from "@/components/cash-register/NewRegisterCard";
import { formatCurrency, formatDate, getStatusBadgeClass, getStatusLabel } from "@/lib/utils/cashRegisterUtils";
import { CashRegister } from "@/lib/types";

const CashRegisters = () => {
  const { toast } = useToast();
  const { cashRegisters, openRegister, closeRegister, transactions } = useCashRegisters();
  
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(null);

  const handleOpenRegister = (register: CashRegister) => {
    if (register.status === "closed") {
      openRegister(register.id);
      toast({
        title: "Caisse ouverte",
        description: `La caisse "${register.name}" a été ouverte.`
      });
    } else {
      toast({
        title: "Attention",
        description: `La caisse "${register.name}" est déjà ouverte.`,
        variant: "destructive"
      });
    }
  };

  const handleCloseRegister = (register: CashRegister) => {
    if (register.status === "open") {
      closeRegister(register.id);
      toast({
        title: "Caisse fermée",
        description: `La caisse "${register.name}" a été fermée.`
      });
    } else {
      toast({
        title: "Attention",
        description: `La caisse "${register.name}" est déjà fermée.`,
        variant: "destructive"
      });
    }
  };

  const handleReconcileRegister = (register: CashRegister) => {
    toast({
      title: "Rapprochement en cours",
      description: `Le rapprochement pour "${register.name}" a été initié.`
    });
  };

  const filterTransactions = (registerId: string) => {
    return transactions.filter(trans => trans.cashRegisterId === registerId);
  };

  if (selectedRegister) {
    const registerTransactions = filterTransactions(selectedRegister.id);
    // Récupérer la caisse mise à jour depuis le state
    const updatedRegister = cashRegisters.find(r => r.id === selectedRegister.id) || selectedRegister;
    
    return (
      <RegisterDetails 
        register={updatedRegister}
        transactions={registerTransactions}
        onOpenRegister={handleOpenRegister}
        onCloseRegister={handleCloseRegister}
        onReconcileRegister={handleReconcileRegister}
        onBack={() => setSelectedRegister(null)}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getStatusBadge={(status) => <span className={getStatusBadgeClass(status)}>{getStatusLabel(status)}</span>}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Gestion des caisses</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cashRegisters.map((register) => (
          <RegisterCard 
            key={register.id}
            register={register}
            onClick={() => setSelectedRegister(register)}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusBadge={(status) => <span className={getStatusBadgeClass(status)}>{getStatusLabel(status)}</span>}
          />
        ))}
        
        {/* Add new register card */}
        <NewRegisterCard onClick={() => {/* Handle adding a new register */}} />
      </div>
    </div>
  );
};

export default CashRegisters;
