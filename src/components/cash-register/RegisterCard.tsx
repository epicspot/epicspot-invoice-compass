
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { CashRegister } from "@/lib/types";

interface RegisterCardProps {
  register: CashRegister;
  onClick: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

const RegisterCard: React.FC<RegisterCardProps> = ({
  register,
  onClick,
  formatCurrency,
  formatDate,
  getStatusBadge
}) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle 
          className="flex justify-between items-center"
          onClick={onClick}
        >
          {register.name}
          <CreditCard className={`h-5 w-5 ${register.status === 'open' ? 'text-green-500' : 'text-red-500'}`} />
        </CardTitle>
        <CardDescription>
          {getStatusBadge(register.status)}
        </CardDescription>
      </CardHeader>
      <CardContent onClick={onClick}>
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
  );
};

export default RegisterCard;
