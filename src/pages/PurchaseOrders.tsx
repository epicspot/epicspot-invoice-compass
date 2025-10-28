import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import PurchaseOrderForm from '@/components/PurchaseOrderForm';
import DataTable from '@/components/DataTable';
import { PurchaseOrder } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const PurchaseOrders = () => {
  const { purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = usePurchaseOrders();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | undefined>();
  const { toast } = useToast();

  const handleSubmit = (orderData: Omit<PurchaseOrder, 'id'>) => {
    if (editingOrder) {
      updatePurchaseOrder(editingOrder.id, orderData);
      toast({
        title: 'Commande modifiée',
        description: 'La commande a été modifiée avec succès.',
      });
    } else {
      addPurchaseOrder(orderData);
      toast({
        title: 'Commande créée',
        description: 'La commande a été créée avec succès.',
      });
    }
    setIsDialogOpen(false);
    setEditingOrder(undefined);
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      deletePurchaseOrder(id);
      toast({
        title: 'Commande supprimée',
        description: 'La commande a été supprimée avec succès.',
      });
    }
  };

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    const variants = {
      draft: 'secondary',
      sent: 'default',
      received: 'default',
      cancelled: 'destructive',
    } as const;

    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      received: 'Reçue',
      cancelled: 'Annulée',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const columns = [
    { 
      key: 'number',
      header: 'N° Commande',
      cell: (item: PurchaseOrder) => item.number,
    },
    { 
      key: 'date',
      header: 'Date', 
      cell: (item: PurchaseOrder) => new Date(item.date).toLocaleDateString('fr-FR'),
    },
    { 
      key: 'supplier',
      header: 'Fournisseur', 
      cell: (item: PurchaseOrder) => item.supplier.name,
    },
    {
      key: 'total',
      header: 'Total',
      cell: (item: PurchaseOrder) => `${item.total.toFixed(2)} €`,
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (item: PurchaseOrder) => getStatusBadge(item.status),
    },
    {
      key: 'expectedDeliveryDate',
      header: 'Livraison prévue',
      cell: (item: PurchaseOrder) => item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate).toLocaleDateString('fr-FR') : '-',
    },
  ];

  const renderActions = (order: PurchaseOrder) => (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => handleEdit(order)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="destructive" size="sm" onClick={() => handleDelete(order.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Commandes fournisseurs</h1>
          <p className="text-muted-foreground">
            Gérez vos commandes auprès des fournisseurs
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle commande
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total commandes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchaseOrders.filter(o => o.status === 'sent').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reçues</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchaseOrders.filter(o => o.status === 'received').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchaseOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={purchaseOrders}
            columns={columns}
            actions={renderActions}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? 'Modifier la commande' : 'Nouvelle commande'}
            </DialogTitle>
          </DialogHeader>
          <PurchaseOrderForm
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingOrder(undefined);
            }}
            initialData={editingOrder}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrders;
