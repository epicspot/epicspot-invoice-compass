import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreditCard, DollarSign, Receipt } from 'lucide-react';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (paymentData: {
    method: 'cash' | 'card' | 'check';
    amount: number;
    cardTransactionNumber?: string;
    cardTerminal?: string;
    checkNumber?: string;
    checkBank?: string;
    checkDate?: string;
    notes?: string;
    generateReceipt: boolean;
  }) => void;
  totalAmount: number;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  onPayment,
  totalAmount
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'check'>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(totalAmount);
  const [cardTransactionNumber, setCardTransactionNumber] = useState('');
  const [cardTerminal, setCardTerminal] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [checkBank, setCheckBank] = useState('');
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [generateReceipt, setGenerateReceipt] = useState(true);

  const handleSubmit = () => {
    if (paymentMethod === 'card' && !cardTransactionNumber.trim()) {
      return;
    }

    if (paymentMethod === 'check' && (!checkNumber.trim() || !checkBank.trim())) {
      return;
    }

    onPayment({
      method: paymentMethod,
      amount: amountPaid,
      cardTransactionNumber: paymentMethod === 'card' ? cardTransactionNumber : undefined,
      cardTerminal: paymentMethod === 'card' ? cardTerminal : undefined,
      checkNumber: paymentMethod === 'check' ? checkNumber : undefined,
      checkBank: paymentMethod === 'check' ? checkBank : undefined,
      checkDate: paymentMethod === 'check' ? checkDate : undefined,
      notes,
      generateReceipt
    });

    // Reset form
    setAmountPaid(totalAmount);
    setCardTransactionNumber('');
    setCardTerminal('');
    setCheckNumber('');
    setCheckBank('');
    setCheckDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enregistrer le paiement</DialogTitle>
          <DialogDescription>
            Montant à payer: {totalAmount.toLocaleString()} FCFA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Method */}
          <div>
            <Label className="mb-2 block">Mode de paiement</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('cash')}
                className="w-full"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Espèces
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Carte
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'check' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('check')}
                className="w-full"
              >
                <Receipt className="h-4 w-4 mr-1" />
                Chèque
              </Button>
            </div>
          </div>

          {/* Payment Details based on method */}
          {paymentMethod === 'cash' && (
            <div>
              <Label htmlFor="amountPaid">Montant reçu (FCFA)</Label>
              <Input
                id="amountPaid"
                type="number"
                min="0"
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
              {amountPaid > totalAmount && (
                <div className="text-sm text-green-600 mt-1">
                  Rendu: {(amountPaid - totalAmount).toLocaleString()} FCFA
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="cardTransactionNumber">Numéro de transaction *</Label>
                <Input
                  id="cardTransactionNumber"
                  type="text"
                  value={cardTransactionNumber}
                  onChange={(e) => setCardTransactionNumber(e.target.value)}
                  placeholder="Ex: 123456789"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cardTerminal">Terminal (optionnel)</Label>
                <Input
                  id="cardTerminal"
                  type="text"
                  value={cardTerminal}
                  onChange={(e) => setCardTerminal(e.target.value)}
                  placeholder="Ex: TPE-01"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'check' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="checkNumber">Numéro de chèque *</Label>
                <Input
                  id="checkNumber"
                  type="text"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  placeholder="Ex: 1234567"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="checkBank">Banque *</Label>
                <Input
                  id="checkBank"
                  type="text"
                  value={checkBank}
                  onChange={(e) => setCheckBank(e.target.value)}
                  placeholder="Ex: Société Générale"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="checkDate">Date du chèque</Label>
                <Input
                  id="checkDate"
                  type="date"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Generate Receipt Option */}
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
            <Checkbox
              id="generateReceipt"
              checked={generateReceipt}
              onCheckedChange={(checked) => setGenerateReceipt(checked as boolean)}
            />
            <Label
              htmlFor="generateReceipt"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Générer une quittance de paiement
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Valider le paiement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
