
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Client } from '@/lib/types';
import { Users } from 'lucide-react';

interface ClientFormProps {
  initialClient?: Partial<Client>;
  onSubmit: (client: Partial<Client>) => void;
  isLoading?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
  initialClient,
  onSubmit,
  isLoading = false
}) => {
  const [client, setClient] = useState<Partial<Client>>(initialClient || {
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(client);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5" />
          {initialClient ? 'Modifier le client' : 'Nouveau client'}
        </h2>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Chargement...' : initialClient ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Nom / Raison sociale *</Label>
              <Input
                id="name"
                value={client.name || ''}
                onChange={(e) => setClient({ ...client, name: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            {initialClient && (
              <div>
                <Label htmlFor="code">Code client</Label>
                <Input
                  id="code"
                  value={client.code || ''}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-medium">Coordonnées</h3>

          <div>
            <Label htmlFor="address">Adresse *</Label>
            <Textarea
              id="address"
              value={client.address || ''}
              onChange={(e) => setClient({ ...client, address: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                value={client.phone || ''}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={client.email || ''}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-medium">Informations fiscales</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="taxInfo">Régime d'imposition</Label>
              <Input
                id="taxInfo"
                value={client.taxInfo || ''}
                onChange={(e) => setClient({ ...client, taxInfo: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="taxCenter">Centre des impôts</Label>
              <Input
                id="taxCenter"
                value={client.taxCenter || ''}
                onChange={(e) => setClient({ ...client, taxCenter: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ClientForm;
