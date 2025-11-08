import { useParams, useNavigate } from 'react-router-dom';
import { useMarkets, useMarketMilestones } from '@/hooks/useMarkets';
import { MarketMilestones } from '@/components/MarketMilestones';
import { MarketDocuments } from '@/components/MarketDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, Calendar, DollarSign, FileText, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MarketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { markets, loading } = useMarkets();
  const { milestones } = useMarketMilestones(id || '');

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  const market = markets.find(m => m.id === id);

  if (!market) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Marché introuvable</p>
          <Button onClick={() => navigate('/markets')} className="mt-4">
            Retour aux marchés
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      submitted: 'outline',
      awarded: 'default',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive'
    };

    const labels: Record<string, string> = {
      draft: 'Brouillon',
      submitted: 'Soumis',
      awarded: 'Attribué',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      public: 'Public',
      private: 'Privé',
      framework: 'Cadre'
    };

    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/markets')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{market.title}</h1>
            <p className="text-muted-foreground">Référence: {market.reference}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {getTypeBadge(market.type)}
          {getStatusBadge(market.status)}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Estimé</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(market.estimated_amount))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Réel</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(market.actual_amount))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{market.clients?.name || 'Non défini'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acompte</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {market.deposit_percentage ? `${market.deposit_percentage}%` : '-'}
            </div>
            {market.deposit_amount && (
              <p className="text-sm text-muted-foreground">{formatCurrency(Number(market.deposit_amount))}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="milestones">Jalons</TabsTrigger>
          <TabsTrigger value="documents">Documents contractuels</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations Générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1">{market.description || 'Aucune description'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date de début</p>
                    <p className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {market.start_date ? format(new Date(market.start_date), 'dd MMMM yyyy', { locale: fr }) : 'Non définie'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de fin</p>
                    <p className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {market.end_date ? format(new Date(market.end_date), 'dd MMMM yyyy', { locale: fr }) : 'Non définie'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Conditions de paiement</p>
                  <p className="mt-1 text-sm">{market.payment_terms || 'Non définies'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conditions de livraison</p>
                  <p className="mt-1 text-sm">{market.delivery_terms || 'Non définies'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones">
          <MarketMilestones marketId={market.id} clientId={market.client_id} />
        </TabsContent>

        <TabsContent value="documents">
          <MarketDocuments market={market} milestones={milestones} />
        </TabsContent>
      </Tabs>
    </div>
  );
}