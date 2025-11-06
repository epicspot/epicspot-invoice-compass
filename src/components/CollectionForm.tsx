import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collection, Invoice } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CollectionFormProps {
  collection?: Collection;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function CollectionForm({ collection, onSubmit, onCancel }: CollectionFormProps) {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: collection || {
      invoiceId: '',
      amount: 0,
      paymentMethod: 'cash',
      reference: '',
      notes: '',
      collectedBy: user?.id || '',
    },
  });

  useEffect(() => {
    // Fetch unpaid and partially paid invoices
    supabase
      .from('invoices')
      .select(`
        id,
        number,
        total,
        remaining_balance,
        payment_status,
        clients:client_id (
          id,
          name
        )
      `)
      .in('payment_status', ['unpaid', 'partial'])
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setInvoices(data);
        }
      });
  }, []);

  const invoiceId = watch('invoiceId');
  const paymentMethod = watch('paymentMethod');
  const selectedInvoice = invoices.find(inv => inv.id === invoiceId);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {collection ? 'Modifier le recouvrement' : 'Nouveau recouvrement'}
      </h2>
      <form onSubmit={handleSubmit((data) => {
        onSubmit({
          ...data,
          clientId: selectedInvoice?.clients?.id,
        });
      })} className="space-y-4">
        <div>
          <Label htmlFor="invoiceId">Facture impayée *</Label>
          <Select
            value={invoiceId || ''}
            onValueChange={(value) => {
              setValue('invoiceId', value);
              const invoice = invoices.find(inv => inv.id === value);
              if (invoice) {
                setValue('amount', invoice.remaining_balance);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une facture" />
            </SelectTrigger>
            <SelectContent>
              {invoices.map((invoice) => (
                <SelectItem key={invoice.id} value={invoice.id}>
                  {invoice.number} - {invoice.clients?.name} - Reste: {invoice.remaining_balance?.toFixed(2)} FCFA
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedInvoice && (
            <p className="text-sm text-muted-foreground mt-1">
              Solde restant: {selectedInvoice.remaining_balance?.toFixed(2)} FCFA
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Montant recouvré *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', { required: true, min: 0 })}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="reference">Référence</Label>
            <Input
              id="reference"
              {...register('reference')}
              placeholder="Reçu #..."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="paymentMethod">Mode de paiement *</Label>
          <Select
            value={paymentMethod}
            onValueChange={(value) => setValue('paymentMethod', value as 'cash' | 'check' | 'mobile_money' | 'bank_transfer')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Espèces</SelectItem>
              <SelectItem value="check">Chèque</SelectItem>
              <SelectItem value="mobile_money">Mobile Money</SelectItem>
              <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Notes additionnelles..."
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit">
            {collection ? 'Modifier' : 'Enregistrer'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  );
}
