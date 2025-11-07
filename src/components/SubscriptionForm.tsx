import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Subscription } from '@/hooks/useSubscriptions';
import { useClients } from '@/hooks/useClients';
import { Wifi } from 'lucide-react';

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subscription: any) => void;
  initialData?: Partial<Subscription>;
}

const serviceTypes = [
  { value: 'fiber', label: 'Fibre optique' },
  { value: 'adsl', label: 'ADSL' },
  { value: '4g', label: '4G/LTE' },
  { value: 'satellite', label: 'Satellite' },
];

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { clients } = useClients();
  
  const [formData, setFormData] = useState({
    clientId: initialData?.clientId || '',
    serviceName: initialData?.serviceName || '',
    serviceType: initialData?.serviceType || 'fiber',
    monthlyAmount: initialData?.monthlyAmount || 0,
    billingDay: initialData?.billingDay || 1,
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate || '',
    status: initialData?.status || 'active',
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            {initialData ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client *</Label>
              <Select 
                value={formData.clientId} 
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="serviceName">Nom du service *</Label>
              <Input
                id="serviceName"
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                placeholder="Ex: Forfait Premium 100Mbps"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="serviceType">Type de service *</Label>
              <Select 
                value={formData.serviceType} 
                onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="monthlyAmount">Montant mensuel (FCFA) *</Label>
              <Input
                id="monthlyAmount"
                type="number"
                min="0"
                step="100"
                value={formData.monthlyAmount}
                onChange={(e) => setFormData({ ...formData, monthlyAmount: parseFloat(e.target.value) })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="billingDay">Jour de facturation (1-28) *</Label>
              <Input
                id="billingDay"
                type="number"
                min="1"
                max="28"
                value={formData.billingDay}
                onChange={(e) => setFormData({ ...formData, billingDay: parseInt(e.target.value) })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="startDate">Date de début *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">Date de fin (optionnel)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Statut *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'suspended' | 'cancelled' })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes supplémentaires..."
              rows={3}
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {initialData ? 'Mettre à jour' : 'Créer l\'abonnement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};