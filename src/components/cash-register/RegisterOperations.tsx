import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Banknote, ArrowUpDown, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CashRegister } from "@/lib/types";

interface RegisterOperationsProps {
  register: CashRegister;
  onDeposit: (amount: number, notes: string) => void;
  onWithdrawal: (amount: number, notes: string) => void;
  onAdjustment: (amount: number, notes: string) => void;
}

type OperationType = 'deposit' | 'withdrawal' | 'adjustment' | null;

const RegisterOperations: React.FC<RegisterOperationsProps> = ({
  register,
  onDeposit,
  onWithdrawal,
  onAdjustment
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [operationType, setOperationType] = useState<OperationType>(null);
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const openDialog = (type: OperationType) => {
    setOperationType(type);
    setAmount(0);
    setNotes('');
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (amount <= 0) {
      return;
    }

    switch (operationType) {
      case 'deposit':
        onDeposit(amount, notes);
        break;
      case 'withdrawal':
        onWithdrawal(amount, notes);
        break;
      case 'adjustment':
        onAdjustment(amount, notes);
        break;
    }

    setIsDialogOpen(false);
    setAmount(0);
    setNotes('');
  };

  const getDialogTitle = () => {
    switch (operationType) {
      case 'deposit':
        return 'Dépôt d\'espèces';
      case 'withdrawal':
        return 'Retrait d\'espèces';
      case 'adjustment':
        return 'Ajustement de caisse';
      default:
        return '';
    }
  };

  const getDialogDescription = () => {
    switch (operationType) {
      case 'deposit':
        return 'Enregistrer un dépôt d\'espèces dans la caisse';
      case 'withdrawal':
        return 'Enregistrer un retrait d\'espèces de la caisse';
      case 'adjustment':
        return 'Ajuster le montant de la caisse (positif ou négatif)';
      default:
        return '';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Opérations de caisse</CardTitle>
          <CardDescription>
            Effectuez des opérations manuelles sur la caisse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg mb-4">
            <div className="text-sm text-muted-foreground">Solde actuel</div>
            <div className="text-2xl font-bold">
              {register.currentAmount.toLocaleString()} FCFA
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              className="h-24" 
              variant="outline"
              onClick={() => openDialog('deposit')}
              disabled={register.status !== 'open'}
            >
              <div className="flex flex-col items-center">
                <ArrowDownCircle className="h-8 w-8 mb-2 text-green-600" />
                <span>Dépôt d'espèces</span>
              </div>
            </Button>
            
            <Button 
              className="h-24" 
              variant="outline"
              onClick={() => openDialog('withdrawal')}
              disabled={register.status !== 'open'}
            >
              <div className="flex flex-col items-center">
                <ArrowUpCircle className="h-8 w-8 mb-2 text-red-600" />
                <span>Retrait d'espèces</span>
              </div>
            </Button>
          </div>
          
          <Button 
            className="w-full h-16" 
            variant="outline"
            onClick={() => openDialog('adjustment')}
            disabled={register.status !== 'open'}
          >
            <div className="flex flex-col items-center">
              <ArrowUpDown className="h-6 w-6 mb-1" />
              <span>Ajustement de caisse</span>
            </div>
          </Button>

          {register.status !== 'open' && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              La caisse doit être ouverte pour effectuer des opérations
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>{getDialogDescription()}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">
                Montant (FCFA) *
                {operationType === 'adjustment' && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Utilisez un nombre négatif pour réduire le montant)
                  </span>
                )}
              </Label>
              <Input
                id="amount"
                type="number"
                min={operationType === 'adjustment' ? undefined : "0"}
                step="0.01"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes / Motif</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                placeholder="Raison de l'opération..."
                rows={3}
              />
            </div>

            {operationType === 'adjustment' && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  Nouveau solde après ajustement: {' '}
                  <span className="font-bold">
                    {(register.currentAmount + amount).toLocaleString()} FCFA
                  </span>
                </p>
              </div>
            )}

            {operationType === 'deposit' && amount > 0 && (
              <div className="p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-800">
                  Nouveau solde après dépôt: {' '}
                  <span className="font-bold">
                    {(register.currentAmount + amount).toLocaleString()} FCFA
                  </span>
                </p>
              </div>
            )}

            {operationType === 'withdrawal' && amount > 0 && (
              <div className="p-3 bg-orange-50 rounded-md">
                <p className="text-sm text-orange-800">
                  Nouveau solde après retrait: {' '}
                  <span className="font-bold">
                    {(register.currentAmount - amount).toLocaleString()} FCFA
                  </span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={amount === 0}
            >
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegisterOperations;
