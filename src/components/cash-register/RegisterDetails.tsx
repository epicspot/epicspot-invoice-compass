
import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowUpDown } from "lucide-react";
import { CashRegister, CashTransaction } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RegisterTransactions from "./RegisterTransactions";
import RegisterOperations from "./RegisterOperations";

interface RegisterDetailsProps {
  register: CashRegister;
  transactions: CashTransaction[];
  onOpenRegister: (register: CashRegister) => void;
  onCloseRegister: (register: CashRegister) => void;
  onReconcileRegister: (register: CashRegister) => void;
  onDeposit: (registerId: string, amount: number, notes: string) => void;
  onWithdrawal: (registerId: string, amount: number, notes: string) => void;
  onAdjustment: (registerId: string, amount: number, notes: string) => void;
  onBack: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

const RegisterDetails: React.FC<RegisterDetailsProps> = ({
  register,
  transactions,
  onOpenRegister,
  onCloseRegister,
  onReconcileRegister,
  onDeposit,
  onWithdrawal,
  onAdjustment,
  onBack,
  formatCurrency,
  formatDate,
  getStatusBadge,
}) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            Retour aux caisses
          </Button>
          <h1 className="text-3xl font-bold">{register.name}</h1>
          <div className="flex items-center mt-2 space-x-2">
            {getStatusBadge(register.status)}
            <span className="text-sm text-muted-foreground">
              Solde actuel : {formatCurrency(register.currentAmount)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {register.status === "closed" && (
            <Button onClick={() => onOpenRegister(register)}>
              <CreditCard className="mr-2 h-4 w-4" /> Ouvrir la caisse
            </Button>
          )}
          {register.status === "open" && (
            <>
              <Button variant="outline" onClick={() => onReconcileRegister(register)}>
                <ArrowUpDown className="mr-2 h-4 w-4" /> Rapprochement
              </Button>
              <Button onClick={() => onCloseRegister(register)} variant="destructive">
                Fermer la caisse
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="operations">Opérations de caisse</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <RegisterTransactions 
            transactions={transactions}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>
        
        <TabsContent value="operations">
          <RegisterOperations 
            register={register}
            onDeposit={(amount, notes) => onDeposit(register.id, amount, notes)}
            onWithdrawal={(amount, notes) => onWithdrawal(register.id, amount, notes)}
            onAdjustment={(amount, notes) => onAdjustment(register.id, amount, notes)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegisterDetails;
