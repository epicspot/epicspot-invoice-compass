import { useState } from 'react';
import { useMarkets } from '@/hooks/useMarkets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MarketForm } from '@/components/MarketForm';
import { Plus, Search, Edit, Trash2, Eye, FileText, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Markets() {
  const { markets, loading, createMarket, updateMarket, deleteMarket } = useMarkets();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMarket, setEditingMarket] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateMarket = async (data: any) => {
    await createMarket(data);
    setIsFormOpen(false);
  };

  const handleUpdateMarket = async (data: any) => {
    if (editingMarket) {
      await updateMarket(editingMarket.id, data);
      setEditingMarket(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteMarket = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce marché ?')) {
      await deleteMarket(id);
    }
  };

  const filteredMarkets = markets.filter(market =>
    market.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Calculate statistics
  const stats = {
    total: markets.length,
    inProgress: markets.filter(m => m.status === 'in_progress').length,
    completed: markets.filter(m => m.status === 'completed').length,
    totalValue: markets.reduce((sum, m) => sum + Number(m.estimated_amount), 0)
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Marchés</h1>
          <p className="text-muted-foreground">Gérez vos marchés publics et privés</p>
        </div>
        <Button onClick={() => { setEditingMarket(null); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau marché
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Marchés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un marché..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Markets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Marchés</CardTitle>
          <CardDescription>
            {filteredMarkets.length} marché(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredMarkets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun marché trouvé. Cliquez sur "Nouveau marché" pour commencer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant Estimé</TableHead>
                  <TableHead>Début</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMarkets.map((market) => (
                  <TableRow key={market.id}>
                    <TableCell className="font-medium">{market.reference}</TableCell>
                    <TableCell>{market.title}</TableCell>
                    <TableCell>{market.clients?.name || '-'}</TableCell>
                    <TableCell>{getTypeBadge(market.type)}</TableCell>
                    <TableCell>{formatCurrency(Number(market.estimated_amount))}</TableCell>
                    <TableCell>
                      {market.start_date ? format(new Date(market.start_date), 'dd/MM/yyyy', { locale: fr }) : '-'}
                    </TableCell>
                    <TableCell>
                      {market.end_date ? format(new Date(market.end_date), 'dd/MM/yyyy', { locale: fr }) : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(market.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingMarket(market); setIsFormOpen(true); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteMarket(market.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMarket ? 'Modifier le marché' : 'Nouveau marché'}
            </DialogTitle>
          </DialogHeader>
          <MarketForm
            market={editingMarket}
            onSubmit={editingMarket ? handleUpdateMarket : handleCreateMarket}
            onCancel={() => { setIsFormOpen(false); setEditingMarket(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}