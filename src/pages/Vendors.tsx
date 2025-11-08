import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VendorForm } from '@/components/VendorForm';
import { useVendors } from '@/hooks/useVendors';
import { Vendor } from '@/lib/types';
import { Plus, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Vendors() {
  const { vendors, loading, createVendor, updateVendor, deleteVendor } = useVendors();
  const [isCreating, setIsCreating] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<Vendor | null>(null);

  const handleCreateVendor = async (data: any) => {
    try {
      await createVendor(data);
      setIsCreating(false);
      toast.success('Vendeur créé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création du vendeur');
    }
  };

  const handleEditVendor = async (data: any) => {
    if (!editingVendor) return;
    try {
      await updateVendor(editingVendor.id, data);
      setEditingVendor(null);
      toast.success('Vendeur modifié avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification du vendeur');
    }
  };

  const handleDeleteVendor = async () => {
    if (!deletingVendor) return;
    try {
      await deleteVendor(deletingVendor.id);
      setDeletingVendor(null);
      toast.success('Vendeur supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression du vendeur');
    }
  };

  if (isCreating) {
    return (
      <div className="p-6">
        <VendorForm
          onSubmit={handleCreateVendor}
          onCancel={() => setIsCreating(false)}
        />
      </div>
    );
  }

  if (editingVendor) {
    return (
      <div className="p-6">
        <VendorForm
          vendor={editingVendor}
          onSubmit={handleEditVendor}
          onCancel={() => setEditingVendor(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendeurs Ambulants</h1>
          <p className="text-muted-foreground">Gestion des vendeurs et créances</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau vendeur
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Site</TableHead>
              <TableHead className="text-right">Dette totale</TableHead>
              <TableHead className="text-right">Payé</TableHead>
              <TableHead className="text-right">Reste dû</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Aucun vendeur trouvé
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.code}</TableCell>
                  <TableCell>{vendor.name}</TableCell>
                  <TableCell>{vendor.phone}</TableCell>
                  <TableCell>{vendor.siteId}</TableCell>
                  <TableCell className="text-right">
                    {vendor.totalDebt.toLocaleString()} FCFA
                  </TableCell>
                  <TableCell className="text-right">
                    {vendor.paidAmount.toLocaleString()} FCFA
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {vendor.remainingBalance.toLocaleString()} FCFA
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        vendor.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {vendor.active ? 'Actif' : 'Inactif'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingVendor(vendor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingVendor(vendor)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!deletingVendor} onOpenChange={() => setDeletingVendor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le vendeur {deletingVendor?.name} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVendor}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
