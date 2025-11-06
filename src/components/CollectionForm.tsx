import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collection, Vendor } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface CollectionFormProps {
  collection?: Collection;
  vendors: Vendor[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function CollectionForm({ collection, vendors, onSubmit, onCancel }: CollectionFormProps) {
  const { user } = useAuth();
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: collection || {
      vendorId: '',
      amount: 0,
      collectionDate: format(new Date(), 'yyyy-MM-dd'),
      collectorId: user?.id || '',
      paymentMethod: 'cash',
      notes: '',
    },
  });

  const vendorId = watch('vendorId');
  const paymentMethod = watch('paymentMethod');
  const selectedVendor = vendors.find(v => v.id === vendorId);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {collection ? 'Modifier le recouvrement' : 'Nouveau recouvrement'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="vendorId">Vendeur *</Label>
          <Select
            value={vendorId}
            onValueChange={(value) => setValue('vendorId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un vendeur" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name} - Reste à recouvrer: {vendor.remainingBalance.toFixed(2)} FCFA
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedVendor && (
            <p className="text-sm text-muted-foreground mt-1">
              Solde actuel: {selectedVendor.remainingBalance.toFixed(2)} FCFA
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
            <Label htmlFor="collectionDate">Date de recouvrement *</Label>
            <Input
              id="collectionDate"
              type="date"
              {...register('collectionDate', { required: true })}
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
