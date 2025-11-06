import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CollectionForm } from '@/components/CollectionForm';
import { useCollections } from '@/hooks/useCollections';
import { useVendors } from '@/hooks/useVendors';
import { Collection } from '@/lib/types';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
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

export default function Collections() {
  const { collections, loading, createCollection, updateCollection, deleteCollection } = useCollections();
  const { vendors } = useVendors();
  const [isCreating, setIsCreating] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

  const handleCreateCollection = async (data: any) => {
    try {
      await createCollection(data);
      setIsCreating(false);
      toast.success('Recouvrement enregistré avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement du recouvrement');
    }
  };

  const handleEditCollection = async (data: any) => {
    if (!editingCollection) return;
    try {
      await updateCollection(editingCollection.id, data);
      setEditingCollection(null);
      toast.success('Recouvrement modifié avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification du recouvrement');
    }
  };

  const handleDeleteCollection = async () => {
    if (!deletingCollection) return;
    try {
      await deleteCollection(deletingCollection.id);
      setDeletingCollection(null);
      toast.success('Recouvrement supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression du recouvrement');
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Espèces',
      check: 'Chèque',
      mobile_money: 'Mobile Money',
      bank_transfer: 'Virement bancaire',
    };
    return labels[method] || method;
  };

  if (isCreating) {
    return (
      <div className="p-6">
        <CollectionForm
          vendors={vendors}
          onSubmit={handleCreateCollection}
          onCancel={() => setIsCreating(false)}
        />
      </div>
    );
  }

  if (editingCollection) {
    return (
      <div className="p-6">
        <CollectionForm
          collection={editingCollection}
          vendors={vendors}
          onSubmit={handleEditCollection}
          onCancel={() => setEditingCollection(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recouvrements</h1>
          <p className="text-muted-foreground">Historique des recouvrements</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau recouvrement
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Vendeur</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Mode de paiement</TableHead>
              <TableHead>Collecteur</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : collections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Aucun recouvrement trouvé
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection: any) => (
                <TableRow key={collection.id}>
                  <TableCell>
                    {format(new Date(collection.collectionDate), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{collection.vendorName}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {collection.amount.toFixed(2)} FCFA
                  </TableCell>
                  <TableCell>{getPaymentMethodLabel(collection.paymentMethod)}</TableCell>
                  <TableCell>{collection.collectorName}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {collection.notes || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingCollection(collection)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingCollection(collection)}
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

      <AlertDialog open={!!deletingCollection} onOpenChange={() => setDeletingCollection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce recouvrement ?
              Cette action est irréversible et mettra à jour le solde du vendeur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCollection}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
