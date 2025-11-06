import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vendor, Site } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

interface VendorFormProps {
  vendor?: Vendor;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function VendorForm({ vendor, onSubmit, onCancel }: VendorFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: vendor || {
      code: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      siteId: '',
    },
  });

  const [sites, setSites] = useState<Site[]>([]);
  useEffect(() => {
    supabase
      .from('sites')
      .select('id,name')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setSites((data as Site[]) || []);
      });
  }, []);

  const siteId = watch('siteId');
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {vendor ? 'Modifier le vendeur' : 'Nouveau vendeur'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Code vendeur</Label>
            <Input
              id="code"
              {...register('code', { required: true })}
              placeholder="V001"
            />
          </div>
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              {...register('name', { required: true })}
              placeholder="Nom du vendeur"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              {...register('phone', { required: true })}
              placeholder="+225 XX XX XX XX"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="email@exemple.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="Adresse complète"
          />
        </div>

        <div>
          <Label htmlFor="siteId">Site *</Label>
          <Select
            value={siteId || ''}
            onValueChange={(value) => setValue('siteId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit">
            {vendor ? 'Modifier' : 'Créer'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  );
}
