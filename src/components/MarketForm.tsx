import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useClients } from '@/hooks/useClients';
import { useSites } from '@/hooks/useSites';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Market } from '@/hooks/useMarkets';

interface MarketFormProps {
  market?: Market;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function MarketForm({ market, onSubmit, onCancel }: MarketFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: market || {
      title: '',
      description: '',
      type: 'public',
      status: 'draft',
      estimated_amount: 0,
      actual_amount: 0,
      deposit_percentage: 0
    }
  });

  const { clients } = useClients();
  const { sites } = useSites();

  const depositPercentage = watch('deposit_percentage');
  const estimatedAmount = watch('estimated_amount');

  useEffect(() => {
    if (depositPercentage && estimatedAmount) {
      const depositAmount = (Number(estimatedAmount) * Number(depositPercentage)) / 100;
      setValue('deposit_amount', depositAmount);
    }
  }, [depositPercentage, estimatedAmount, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations Générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre du marché *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Le titre est requis' })}
                placeholder="Ex: Construction bâtiment administratif"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Type de marché</Label>
              <Select
                value={watch('type')}
                onValueChange={(value: 'public' | 'private' | 'framework') => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Marché Public</SelectItem>
                  <SelectItem value="private">Marché Privé</SelectItem>
                  <SelectItem value="framework">Marché Cadre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
              placeholder="Description détaillée du marché..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_id">Client</Label>
              <Select
                value={watch('client_id')}
                onValueChange={(value) => setValue('client_id', value)}
              >
                <SelectTrigger>
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
              <Label htmlFor="site_id">Site</Label>
              <Select
                value={watch('site_id')}
                onValueChange={(value) => setValue('site_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations Financières</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_amount">Montant Estimé (FCFA) *</Label>
              <Input
                id="estimated_amount"
                type="number"
                {...register('estimated_amount', { 
                  required: 'Le montant est requis',
                  min: { value: 0, message: 'Le montant doit être positif' }
                })}
              />
              {errors.estimated_amount && (
                <p className="text-sm text-red-500 mt-1">{errors.estimated_amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="actual_amount">Montant Réel (FCFA)</Label>
              <Input
                id="actual_amount"
                type="number"
                {...register('actual_amount')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deposit_percentage">Acompte (%)</Label>
              <Input
                id="deposit_percentage"
                type="number"
                {...register('deposit_percentage')}
                min="0"
                max="100"
              />
            </div>

            <div>
              <Label htmlFor="deposit_amount">Montant Acompte (FCFA)</Label>
              <Input
                id="deposit_amount"
                type="number"
                {...register('deposit_amount')}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendrier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Date de début</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
              />
            </div>

            <div>
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Statut</Label>
            <Select
              value={watch('status')}
              onValueChange={(value: 'draft' | 'submitted' | 'awarded' | 'in_progress' | 'completed' | 'cancelled') => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="submitted">Soumis</SelectItem>
                <SelectItem value="awarded">Attribué</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="payment_terms">Conditions de paiement</Label>
            <Textarea
              id="payment_terms"
              {...register('payment_terms')}
              rows={3}
              placeholder="Ex: 30% à la commande, 40% à mi-parcours, 30% à la livraison"
            />
          </div>

          <div>
            <Label htmlFor="delivery_terms">Conditions de livraison</Label>
            <Textarea
              id="delivery_terms"
              {...register('delivery_terms')}
              rows={3}
              placeholder="Ex: Livraison sur site, installation comprise"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {market ? 'Mettre à jour' : 'Créer le marché'}
        </Button>
      </div>
    </form>
  );
}