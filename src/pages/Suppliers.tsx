import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import SupplierForm from '@/components/SupplierForm';
import DataTable from '@/components/DataTable';
import { Supplier } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const Suppliers = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const { toast } = useToast();

  const handleSubmit = async (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    try {
      if (editingSupplier) {
        const result = await updateSupplier(editingSupplier.id, supplierData);
        if (!result.success) {
          toast({
            title: 'Erreur',
            description: result.error || 'Impossible de modifier le fournisseur',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Fournisseur modifié',
          description: 'Le fournisseur a été modifié avec succès.',
        });
      } else {
        const result = await addSupplier(supplierData);
        if (!result.success) {
          toast({
            title: 'Erreur',
            description: result.error || 'Impossible de créer le fournisseur',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Fournisseur créé',
          description: 'Le fournisseur a été créé avec succès.',
        });
      }
      setIsDialogOpen(false);
      setEditingSupplier(undefined);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue s\'est produite',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        const result = await deleteSupplier(id);
        if (!result.success) {
          toast({
            title: 'Erreur',
            description: result.error || 'Impossible de supprimer le fournisseur',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Fournisseur supprimé',
          description: 'Le fournisseur a été supprimé avec succès.',
        });
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Une erreur inattendue s\'est produite',
          variant: 'destructive',
        });
      }
    }
  };

  const columns = [
    { key: 'code', header: 'Code', cell: (item: Supplier) => item.code },
    { key: 'name', header: 'Nom', cell: (item: Supplier) => item.name },
    { key: 'contactPerson', header: 'Contact', cell: (item: Supplier) => item.contactPerson },
    { key: 'phone', header: 'Téléphone', cell: (item: Supplier) => item.phone },
    { key: 'email', header: 'Email', cell: (item: Supplier) => item.email },
    {
      key: 'active',
      header: 'Statut',
      cell: (item: Supplier) => (
        <Badge variant={item.active ? 'default' : 'secondary'}>
          {item.active ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
  ];

  const renderActions = (supplier: Supplier) => (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="destructive" size="sm" onClick={() => handleDelete(supplier.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fournisseurs</h1>
          <p className="text-muted-foreground">
            Gérez vos fournisseurs et leurs informations
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau fournisseur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des fournisseurs</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={suppliers}
            columns={columns}
            actions={renderActions}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
            </DialogTitle>
          </DialogHeader>
          <SupplierForm
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingSupplier(undefined);
            }}
            initialData={editingSupplier}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;
