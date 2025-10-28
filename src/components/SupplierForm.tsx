import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Supplier } from '@/lib/types';

interface SupplierFormProps {
  onSubmit: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: Supplier;
}

const SupplierForm = ({ onSubmit, onCancel, initialData }: SupplierFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    contactPerson: initialData?.contactPerson || '',
    taxInfo: initialData?.taxInfo || '',
    bankAccount: initialData?.bankAccount || '',
    notes: initialData?.notes || '',
    active: initialData?.active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du fournisseur *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Code fournisseur</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPerson">Personne de contact</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxInfo">N° TVA intracommunautaire</Label>
          <Input
            id="taxInfo"
            value={formData.taxInfo}
            onChange={(e) => setFormData({ ...formData, taxInfo: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bankAccount">Compte bancaire / IBAN</Label>
          <Input
            id="bankAccount"
            value={formData.bankAccount}
            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <Label htmlFor="active">Fournisseur actif</Label>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {initialData ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;
