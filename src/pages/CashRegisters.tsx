
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, PlusCircle, Banknote, Receipt, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CashRegister, CashTransaction } from "@/lib/types";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

const CashRegisters = () => {
  const { toast } = useToast();
  
  // Mock data for cash registers with correct status type
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([
    {
      id: "reg-1",
      name: "Caisse principale",
      siteId: "site-1",
      initialAmount: 100,
      currentAmount: 350.75,
      lastReconciled: "2025-05-04T15:30:00",
      status: "open" as const
    },
    {
      id: "reg-2",
      name: "Caisse secondaire",
      siteId: "site-1",
      initialAmount: 50,
      currentAmount: 120.25,
      lastReconciled: "2025-05-03T18:45:00",
      status: "closed" as const
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Ouverte</span>;
      case "closed":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Fermée</span>;
      case "reconciling":
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">En rapprochement</span>;
      default:
        return null;
    }
  };

  if (selectedRegister) {
    const registerTransactions = filterTransactions(selectedRegister.id);
    
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Button variant="outline" onClick={handleBackToList} className="mb-4">
              Retour aux caisses
            </Button>
            <h1 className="text-3xl font-bold">{selectedRegister.name}</h1>
            <div className="flex items-center mt-2 space-x-2">
              {getStatusBadge(selectedRegister.status)}
              <span className="text-sm text-muted-foreground">
                Solde actuel : {formatCurrency(selectedRegister.currentAmount)}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {selectedRegister.status === "closed" && (
              <Button onClick={() => handleOpenRegister(selectedRegister)}>
                <CreditCard className="mr-2 h-4 w-4" /> Ouvrir la caisse
              </Button>
            )}
            {selectedRegister.status === "open" && (
              <>
                <Button variant="outline" onClick={() => handleReconcileRegister(selectedRegister)}>
                  <ArrowUpDown className="mr-2 h-4 w-4" /> Rapprochement
                </Button>
                <Button onClick={() => handleCloseRegister(selectedRegister)} variant="destructive">
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
            <Card>
              <CardHeader>
                <CardTitle>Historique des transactions</CardTitle>
                <CardDescription>
                  Toutes les transactions effectuées sur cette caisse
                </CardDescription>
              </CardHeader>
              <CardContent>
                {registerTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {registerTransactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          {transaction.type === "sale" && <Receipt className="h-8 w-8 text-green-500" />}
                          {transaction.type === "refund" && <Receipt className="h-8 w-8 text-red-500" />}
                          {transaction.type === "deposit" && <Banknote className="h-8 w-8 text-blue-500" />}
                          {transaction.type === "withdrawal" && <Banknote className="h-8 w-8 text-orange-500" />}
                          {transaction.type === "adjustment" && <ArrowUpDown className="h-8 w-8 text-purple-500" />}
                          
                          <div>
                            <div className="font-medium">
                              {transaction.type === "sale" && "Vente"}
                              {transaction.type === "refund" && "Remboursement"}
                              {transaction.type === "deposit" && "Dépôt"}
                              {transaction.type === "withdrawal" && "Retrait"}
                              {transaction.type === "adjustment" && "Ajustement"}
                              {transaction.reference && ` - Réf: ${transaction.reference}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(transaction.date)}
                            </div>
                            {transaction.notes && (
                              <div className="text-sm">{transaction.notes}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className={`text-lg font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium">Aucune transaction</h3>
                    <p className="text-sm text-muted-foreground">
                      Cette caisse n'a pas encore de transactions enregistrées.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="operations">
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
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Gestion des caisses</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cashRegisters.map((register) => (
          <Card key={register.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle 
                className="flex justify-between items-center"
                onClick={() => handleSelectRegister(register)}
              >
                {register.name}
                <CreditCard className={`h-5 w-5 ${register.status === 'open' ? 'text-green-500' : 'text-red-500'}`} />
              </CardTitle>
              <CardDescription>
                {getStatusBadge(register.status)}
              </CardDescription>
            </CardHeader>
            <CardContent onClick={() => handleSelectRegister(register)}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Solde initial:</span>
                  <span>{formatCurrency(register.initialAmount)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-sm text-muted-foreground">Solde actuel:</span>
                  <span>{formatCurrency(register.currentAmount)}</span>
                </div>
                {register.lastReconciled && (
                  <div className="text-xs text-muted-foreground pt-2">
                    Dernier rapprochement: {formatDate(register.lastReconciled)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add new register card */}
        <Card className="flex flex-col items-center justify-center h-full min-h-[200px] border-dashed cursor-pointer hover:border-gray-400 transition-colors">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <PlusCircle className="h-12 w-12 text-gray-400 mb-2" />
            <p className="font-medium text-lg">Ajouter une caisse</p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Configurez une nouvelle caisse enregistreuse
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashRegisters;
