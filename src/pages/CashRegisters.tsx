import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CashRegister, CashTransaction } from "@/lib/types";
import RegisterDetails from "@/components/cash-register/RegisterDetails";
import RegisterCard from "@/components/cash-register/RegisterCard";
import NewRegisterCard from "@/components/cash-register/NewRegisterCard";
import { formatCurrency, formatDate, getStatusBadgeClass, getStatusLabel } from "@/lib/utils/cashRegisterUtils";

const CashRegisters = () => {
  const { toast } = useToast();
  
  // Mock data for cash registers
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([
    {
      id: "reg-1",
      name: "Caisse principale",
      siteId: "site-1",
      initialAmount: 100,
      currentAmount: 350.75,
      lastReconciled: "2025-05-04T15:30:00",
      status: "open" as const // Using 'as const' to ensure TypeScript knows this is a literal
    },
    {
      id: "reg-2",
      name: "Caisse secondaire",
      siteId: "site-1",
      initialAmount: 50,
      currentAmount: 120.25,
      lastReconciled: "2025-05-03T18:45:00",
      status: "closed" as const // Using 'as const' to ensure TypeScript knows this is a literal
    }
  ]);
  
  // Mock data for transactions
  const [transactions, setTransactions] = useState<CashTransaction[]>([
    {
      id: "trans-1",
      cashRegisterId: "reg-1",
      amount: 45.75,
      type: "sale",
      reference: "FAC-2025-0042",
      date: "2025-05-05T10:23:15",
      userId: "user-1",
      notes: "Paiement en espèces"
    },
    {
      id: "trans-2",
      cashRegisterId: "reg-1",
      amount: -15.30,
      type: "refund",
      reference: "FAC-2025-0038",
      date: "2025-05-05T11:45:30",
      userId: "user-1",
      notes: "Remboursement partiel"
    },
    {
      id: "trans-3",
      cashRegisterId: "reg-1",
      amount: 220.00,
      type: "deposit",
      date: "2025-05-04T09:15:00",
      userId: "user-1",
      notes: "Dépôt d'ouverture"
    }
  ]);

  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(null);

  const handleOpenRegister = (register: CashRegister) => {
    if (register.status === "closed") {
      const updatedRegister = {...register, status: "open" as const};
      setCashRegisters(
        cashRegisters.map(reg => reg.id === register.id ? updatedRegister : reg)
      );
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
      const updatedRegister = {...register, status: "closed" as const};
      setCashRegisters(
        cashRegisters.map(reg => reg.id === register.id ? updatedRegister : reg)
      );
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
    const updatedRegister = {
      ...register, 
      status: "reconciling" as const, 
      lastReconciled: new Date().toISOString()
    };
    setCashRegisters(
      cashRegisters.map(reg => reg.id === register.id ? updatedRegister : reg)
    );
    toast({
      title: "Rapprochement en cours",
      description: `Le rapprochement pour "${register.name}" a été initié.`
    });
  };

  const handleSelectRegister = (register: CashRegister) => {
    setSelectedRegister(register);
  };

  const handleBackToList = () => {
    setSelectedRegister(null);
  };

  const filterTransactions = (registerId: string) => {
    return transactions.filter(trans => trans.cashRegisterId === registerId);
  };

  const getStatusBadge = (status: string) => {
    return <span className={getStatusBadgeClass(status)}>{getStatusLabel(status)}</span>;
  };

  if (selectedRegister) {
    const registerTransactions = filterTransactions(selectedRegister.id);
    
    return (
      <RegisterDetails 
        register={selectedRegister}
        transactions={registerTransactions}
        onOpenRegister={handleOpenRegister}
        onCloseRegister={handleCloseRegister}
        onReconcileRegister={handleReconcileRegister}
        onBack={handleBackToList}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getStatusBadge={getStatusBadge}
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
            onClick={() => handleSelectRegister(register)}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
        ))}
        
        {/* Add new register card */}
        <NewRegisterCard onClick={() => {/* Handle adding a new register */}} />
      </div>
    </div>
  );
};

export default CashRegisters;
