import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/DataTable';
import { SubscriptionForm } from '@/components/SubscriptionForm';
import { useSubscriptions, Subscription } from '@/hooks/useSubscriptions';
import { toast } from '@/hooks/use-toast';
import { Wifi, Plus, Edit, Trash, Pause, Play, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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

const Subscriptions = () => {
  const {
    subscriptions,
    loading,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    suspendSubscription,
    reactivateSubscription,
    cancelSubscription,
  } = useSubscriptions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);

  const handleCreate = async (data: any) => {
    try {
      await createSubscription(data);
      toast({
        title: "Abonnement créé",
        description: "L'abonnement a été créé avec succès.",
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleEdit = async (data: any) => {
    if (!editingSubscription) return;
    
    try {
      await updateSubscription(editingSubscription.id, data);
      toast({
        title: "Abonnement modifié",
        description: "L'abonnement a été mis à jour avec succès.",
      });
      setEditingSubscription(null);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDelete = async () => {
    if (!subscriptionToDelete) return;
    
    try {
      await deleteSubscription(subscriptionToDelete);
      toast({
        title: "Abonnement supprimé",
        description: "L'abonnement a été supprimé avec succès.",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setSubscriptionToDelete(null);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await suspendSubscription(id);
      toast({
        title: "Abonnement suspendu",
        description: "L'abonnement a été suspendu.",
        variant: "destructive",
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await reactivateSubscription(id);
      toast({
        title: "Abonnement réactivé",
        description: "L'abonnement a été réactivé avec succès.",
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelSubscription(id);
      toast({
        title: "Abonnement annulé",
        description: "L'abonnement a été annulé.",
        variant: "destructive",
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  const columns = [
    {
      key: 'client',
      header: 'Client',
      cell: (item: Subscription) => item.client?.name || '-',
    },
    {
      key: 'serviceName',
      header: 'Service',
      cell: (item: Subscription) => (
        <div>
          <div className="font-medium">{item.serviceName}</div>
          <div className="text-sm text-muted-foreground capitalize">{item.serviceType}</div>
        </div>
      ),
    },
    {
      key: 'monthlyAmount',
      header: 'Montant mensuel',
      cell: (item: Subscription) => `${item.monthlyAmount.toLocaleString()} FCFA`,
    },
    {
      key: 'billingDay',
      header: 'Jour de facturation',
      cell: (item: Subscription) => `Le ${item.billingDay} du mois`,
    },
    {
      key: 'nextBillingDate',
      header: 'Prochaine facturation',
      cell: (item: Subscription) => 
        item.nextBillingDate 
          ? new Date(item.nextBillingDate).toLocaleDateString('fr-FR')
          : '-',
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (item: Subscription) => {
        const statusConfig = {
          active: { label: 'Actif', className: 'bg-success/10 text-success border-success/20' },
          suspended: { label: 'Suspendu', className: 'bg-warning/10 text-warning border-warning/20' },
          cancelled: { label: 'Annulé', className: 'bg-destructive/10 text-destructive border-destructive/20' },
        };
        
        const config = statusConfig[item.status];
        return (
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        );
      },
    },
  ];

  const actions = (subscription: Subscription) => (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Actions</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {subscription.status === 'active' && (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-warning"
                onClick={() => handleSuspend(subscription.id)}
              >
                <Pause className="h-4 w-4" /> Suspendre
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {subscription.status === 'suspended' && (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-success"
                onClick={() => handleReactivate(subscription.id)}
              >
                <Play className="h-4 w-4" /> Réactiver
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {subscription.status !== 'cancelled' && (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-destructive"
                onClick={() => handleCancel(subscription.id)}
              >
                <XCircle className="h-4 w-4" /> Annuler l'abonnement
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setEditingSubscription(subscription);
              setIsFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" /> Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 text-red-600 cursor-pointer"
            onClick={() => {
              setSubscriptionToDelete(subscription.id);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash className="h-4 w-4" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wifi className="h-6 w-6 text-primary" />
          Abonnements Internet
        </h1>
        <Button onClick={() => {
          setEditingSubscription(null);
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" /> Nouvel abonnement
        </Button>
      </div>

      <DataTable
        data={subscriptions}
        columns={columns}
        actions={actions}
        searchable={true}
      />

      <SubscriptionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSubscription(null);
        }}
        onSubmit={editingSubscription ? handleEdit : handleCreate}
        initialData={editingSubscription || undefined}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'abonnement sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Subscriptions;