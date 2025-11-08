import { useState } from 'react';
import { useMarketMilestones } from '@/hooks/useMarkets';
import { useInvoices } from '@/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MilestoneForm } from '@/components/MilestoneForm';
import { Plus, Edit, Trash2, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
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
import { toast } from 'sonner';

interface MarketMilestonesProps {
  marketId: string;
  clientId?: string;
}

export function MarketMilestones({ marketId, clientId }: MarketMilestonesProps) {
  const { milestones, loading, createMilestone, updateMilestone, deleteMilestone } = useMarketMilestones(marketId);
  const { createInvoice } = useInvoices();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);

  const handleCreateMilestone = async (data: any) => {
    await createMilestone(data);
    setIsFormOpen(false);
  };

  const handleUpdateMilestone = async (data: any) => {
    if (editingMilestone) {
      await updateMilestone(editingMilestone.id, data);
      setEditingMilestone(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce jalon ?')) {
      await deleteMilestone(id);
    }
  };

  const handleMarkAsCompleted = async (milestone: any) => {
    await updateMilestone(milestone.id, {
      status: 'completed',
      completion_date: new Date().toISOString()
    });
  };

  const handleGenerateInvoice = async (milestone: any) => {
    if (!clientId) {
      toast.error('Aucun client associé à ce marché');
      return;
    }

    try {
      const invoiceData = {
        client_id: clientId,
        date: new Date().toISOString(),
        status: 'draft' as const,
        payment_status: 'unpaid' as const,
        items: [],
        subtotal: milestone.amount,
        tax: 0,
        total: milestone.amount,
        notes: `Facturation du jalon: ${milestone.title}`,
        discount: 0,
        siteId: undefined
      };

      const invoice = await createInvoice(invoiceData as any);
      
      if (invoice && invoice.id) {
        await updateMilestone(milestone.id, {
          invoice_id: invoice.id
        });
        toast.success('Facture générée avec succès');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Erreur lors de la génération de la facture');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: any, label: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'En attente' },
      in_progress: { variant: 'default', icon: Clock, label: 'En cours' },
      completed: { variant: 'default', icon: CheckCircle, label: 'Terminé' },
      cancelled: { variant: 'destructive', icon: XCircle, label: 'Annulé' }
    };

    const { variant, icon: Icon, label } = config[status] || config.pending;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  // Calculate overall progress
  const totalAmount = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
  const completedAmount = milestones
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + Number(m.amount), 0);
  const progressPercentage = totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0;

  if (loading) {
    return <div className="text-center py-8">Chargement des jalons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Jalons du Marché</h3>
          <p className="text-sm text-muted-foreground">
            Suivez l&apos;avancement et la facturation de chaque étape
          </p>
        </div>
        <Button onClick={() => { setEditingMilestone(null); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un jalon
        </Button>
      </div>

      {/* Progress Overview */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avancement Global</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">{formatCurrency(totalAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Réalisé</p>
                <p className="font-semibold text-green-600">{formatCurrency(completedAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Restant</p>
                <p className="font-semibold">{formatCurrency(totalAmount - completedAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Jalons</CardTitle>
          <CardDescription>
            {milestones.length} jalon(s) défini(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun jalon défini. Cliquez sur &quot;Ajouter un jalon&quot; pour commencer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Réalisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Facture</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestones.map((milestone) => (
                  <TableRow key={milestone.id}>
                    <TableCell className="font-medium">
                      {milestone.title}
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(Number(milestone.amount))}</TableCell>
                    <TableCell>{milestone.percentage ? `${milestone.percentage}%` : '-'}</TableCell>
                    <TableCell>
                      {milestone.due_date ? format(new Date(milestone.due_date), 'dd/MM/yyyy', { locale: fr }) : '-'}
                    </TableCell>
                    <TableCell>
                      {milestone.completion_date ? format(new Date(milestone.completion_date), 'dd/MM/yyyy', { locale: fr }) : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(milestone.status)}</TableCell>
                    <TableCell>
                      {milestone.invoice_id ? (
                        <Badge variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Facturée
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {milestone.status !== 'completed' && (
                            <DropdownMenuItem onClick={() => handleMarkAsCompleted(milestone)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marquer comme terminé
                            </DropdownMenuItem>
                          )}
                          {!milestone.invoice_id && milestone.status === 'completed' && (
                            <DropdownMenuItem onClick={() => handleGenerateInvoice(milestone)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Générer facture
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => { setEditingMilestone(milestone); setIsFormOpen(true); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteMilestone(milestone.id)} className="text-destructive">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMilestone ? 'Modifier le jalon' : 'Nouveau jalon'}
            </DialogTitle>
          </DialogHeader>
          <MilestoneForm
            milestone={editingMilestone}
            marketId={marketId}
            onSubmit={editingMilestone ? handleUpdateMilestone : handleCreateMilestone}
            onCancel={() => { setIsFormOpen(false); setEditingMilestone(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}