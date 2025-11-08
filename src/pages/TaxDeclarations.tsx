import { useState } from 'react';
import { useTaxDeclarations } from '@/hooks/useTaxDeclarations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, Calendar, TrendingUp, Download, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TaxDeclarations() {
  const { declarations, loading, generateDeclaration, updateDeclaration, deleteDeclaration } = useTaxDeclarations();
  const [isGenerating, setIsGenerating] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerate = async () => {
    if (!periodStart || !periodEnd) {
      return;
    }

    setIsGenerating(true);
    await generateDeclaration(periodStart, periodEnd);
    setIsGenerating(false);
    setIsDialogOpen(false);
    setPeriodStart('');
    setPeriodEnd('');
  };

  const handleSubmit = async (id: string) => {
    await updateDeclaration(id, { 
      status: 'submitted',
      submitted_at: new Date().toISOString()
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette déclaration ?')) {
      await deleteDeclaration(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      draft: 'secondary',
      submitted: 'default',
      validated: 'default'
    };

    const labels: Record<string, string> = {
      draft: 'Brouillon',
      submitted: 'Soumise',
      validated: 'Validée'
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Déclarations de TVA</h1>
          <p className="text-muted-foreground">Gestion et génération automatique des déclarations fiscales</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Générer une déclaration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle déclaration de TVA</DialogTitle>
              <DialogDescription>
                Sélectionnez la période pour générer automatiquement la déclaration
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="periodStart">Date de début</Label>
                <Input
                  id="periodStart"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="periodEnd">Date de fin</Label>
                <Input
                  id="periodEnd"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleGenerate} disabled={isGenerating || !periodStart || !periodEnd}>
                {isGenerating ? 'Génération...' : 'Générer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total déclarations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{declarations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TVA à payer (période actuelle)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                declarations
                  .filter(d => d.status === 'draft')
                  .reduce((sum, d) => sum + Number(d.vat_due), 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Déclarations soumises</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {declarations.filter(d => d.status === 'submitted' || d.status === 'validated').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des déclarations</CardTitle>
          <CardDescription>Liste de toutes les déclarations de TVA</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : declarations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune déclaration. Cliquez sur "Générer une déclaration" pour commencer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Ventes TTC</TableHead>
                  <TableHead>Achats TTC</TableHead>
                  <TableHead>TVA Collectée</TableHead>
                  <TableHead>TVA Déductible</TableHead>
                  <TableHead>TVA à payer</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {declarations.map((declaration) => (
                  <TableRow key={declaration.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {format(new Date(declaration.period_start), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          au {format(new Date(declaration.period_end), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(Number(declaration.total_sales))}</TableCell>
                    <TableCell>{formatCurrency(Number(declaration.total_purchases))}</TableCell>
                    <TableCell>{formatCurrency(Number(declaration.vat_collected))}</TableCell>
                    <TableCell>{formatCurrency(Number(declaration.vat_paid))}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(Number(declaration.vat_due))}</TableCell>
                    <TableCell>{getStatusBadge(declaration.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {declaration.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleSubmit(declaration.id)}
                          >
                            Soumettre
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        {declaration.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(declaration.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}