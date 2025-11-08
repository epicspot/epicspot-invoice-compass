import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarketMilestone } from '@/hooks/useMarkets';

interface MilestoneFormProps {
  milestone?: MarketMilestone;
  marketId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function MilestoneForm({ milestone, marketId, onSubmit, onCancel }: MilestoneFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: milestone || {
      title: '',
      description: '',
      amount: 0,
      percentage: 0,
      status: 'pending',
      market_id: marketId
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre du jalon *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Le titre est requis' })}
          placeholder="Ex: Livraison phase 1"
        />
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          rows={3}
          placeholder="Description détaillée du jalon..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Montant (FCFA) *</Label>
          <Input
            id="amount"
            type="number"
            {...register('amount', { 
              required: 'Le montant est requis',
              min: { value: 0, message: 'Le montant doit être positif' }
            })}
          />
          {errors.amount && (
            <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="percentage">Pourcentage (%)</Label>
          <Input
            id="percentage"
            type="number"
            {...register('percentage')}
            min="0"
            max="100"
            placeholder="0-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="due_date">Date d&apos;échéance</Label>
          <Input
            id="due_date"
            type="date"
            {...register('due_date')}
          />
        </div>

        <div>
          <Label htmlFor="completion_date">Date de réalisation</Label>
          <Input
            id="completion_date"
            type="date"
            {...register('completion_date')}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Statut</Label>
        <Select
          value={watch('status')}
          onValueChange={(value: 'pending' | 'in_progress' | 'completed' | 'cancelled') => setValue('status', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <input type="hidden" {...register('market_id')} value={marketId} />

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {milestone ? 'Mettre à jour' : 'Créer le jalon'}
        </Button>
      </div>
    </form>
  );
}