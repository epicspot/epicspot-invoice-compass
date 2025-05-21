
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Banknote, ArrowUpDown } from "lucide-react";
import { CashTransaction } from "@/lib/types";

interface RegisterTransactionsProps {
  transactions: CashTransaction[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

const RegisterTransactions: React.FC<RegisterTransactionsProps> = ({
  transactions,
  formatCurrency,
  formatDate,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des transactions</CardTitle>
        <CardDescription>
          Toutes les transactions effectuées sur cette caisse
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
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
  );
};

export default RegisterTransactions;
