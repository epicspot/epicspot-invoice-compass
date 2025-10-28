import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useReminders } from '@/hooks/useReminders';
import { useInvoices } from '@/hooks/useInvoices';
import { useQuotes } from '@/hooks/useQuotes';
import { Bell, Send, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Reminders = () => {
  const { reminders, sendReminder, updateReminder } = useReminders();
  const { invoices } = useInvoices();
  const { quotes } = useQuotes();

  const statusConfig = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    sent: { label: 'Envoyée', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Terminée', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Annulée', color: 'bg-gray-100 text-gray-800' },
  };

  const columns = [
    { 
      key: 'type', 
      header: 'Type',
      cell: (item: any) => (
        <Badge variant="outline">
          {item.type === 'invoice' ? 'Facture' : 'Devis'}
        </Badge>
      )
    },
    { key: 'documentNumber', header: 'Numéro' },
    { key: 'clientName', header: 'Client' },
    { 
      key: 'amount', 
      header: 'Montant',
      cell: (item: any) => `${item.amount.toLocaleString()} FCFA`
    },
    { 
      key: 'dueDate', 
      header: 'Échéance',
      cell: (item: any) => item.dueDate ? new Date(item.dueDate).toLocaleDateString('fr-FR') : '-'
    },
    { 
      key: 'attempts', 
      header: 'Relances',
      cell: (item: any) => `${item.attempts} / 3`
    },
    { 
      key: 'nextReminderDate', 
      header: 'Prochaine relance',
      cell: (item: any) => item.nextReminderDate ? new Date(item.nextReminderDate).toLocaleDateString('fr-FR') : '-'
    },
    { 
      key: 'status', 
      header: 'Statut',
      cell: (item: any) => (
        <Badge className={statusConfig[item.status].color}>
          {statusConfig[item.status].label}
        </Badge>
      )
    },
  ];

  const handleSendReminder = (id: string) => {
    sendReminder(id);
    toast({
      title: "Relance envoyée",
      description: "La relance a été envoyée au client.",
    });
  };

  const handleComplete = (id: string) => {
    updateReminder(id, { status: 'completed' });
    toast({
      title: "Relance terminée",
      description: "La relance a été marquée comme terminée.",
    });
  };

  const handleCancel = (id: string) => {
    updateReminder(id, { status: 'cancelled' });
    toast({
      title: "Relance annulée",
      description: "La relance a été annulée.",
    });
  };

  const actions = (reminder: any) => (
    <div className="flex gap-2">
      {reminder.status === 'pending' && (
        <Button size="sm" onClick={() => handleSendReminder(reminder.id)}>
          <Send className="h-4 w-4 mr-1" /> Envoyer
        </Button>
      )}
      {reminder.status !== 'completed' && reminder.status !== 'cancelled' && (
        <>
          <Button size="sm" variant="outline" onClick={() => handleComplete(reminder.id)}>
            <CheckCircle className="h-4 w-4 mr-1" /> Terminer
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleCancel(reminder.id)}>
            <XCircle className="h-4 w-4 mr-1" /> Annuler
          </Button>
        </>
      )}
    </div>
  );

  const pendingCount = reminders.filter(r => r.status === 'pending').length;
  const sentCount = reminders.filter(r => r.status === 'sent').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Relances
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Bell className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Relances à envoyer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envoyées</CardTitle>
            <Send className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentCount}</div>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminders.length}</div>
            <p className="text-xs text-muted-foreground">Toutes les relances</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des relances</CardTitle>
          <CardDescription>
            Gérez vos relances de factures et devis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={reminders} 
            columns={columns}
            actions={actions}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Reminders;
