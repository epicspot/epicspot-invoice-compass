import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FileText, Download, Eye, Calendar, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SubscriptionInvoice {
  id: string;
  number: string;
  date: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  monthlyAmount: number;
  status: string;
  paymentStatus: string;
  paidAmount: number;
  remainingBalance: number;
  subscriptionId: string;
}

const SubscriptionInvoices = () => {
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      // Récupérer les factures avec les informations client et abonnement
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          number,
          date,
          status,
          payment_status,
          paid_amount,
          remaining_balance,
          client_id,
          clients!inner(id, name, phone),
          invoice_items!inner(
            product_id,
            products(description)
          )
        `)
        .order('date', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Récupérer les abonnements
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('id, client_id, service_name, monthly_amount');

      if (subscriptionsError) throw subscriptionsError;

      // Filtrer les factures d'abonnement et les enrichir
      const subscriptionInvoices = (invoicesData || [])
        .map((invoice: any) => {
          const subscription = subscriptionsData?.find(
            (sub) => sub.client_id === invoice.client_id
          );

          if (!subscription) return null;

          return {
            id: invoice.id,
            number: invoice.number,
            date: invoice.date,
            clientId: invoice.client_id,
            clientName: invoice.clients?.name || 'N/A',
            clientPhone: invoice.clients?.phone || 'N/A',
            serviceName: subscription.service_name,
            monthlyAmount: parseFloat(String(subscription.monthly_amount)),
            status: invoice.status,
            paymentStatus: invoice.payment_status,
            paidAmount: parseFloat(invoice.paid_amount || 0),
            remainingBalance: parseFloat(invoice.remaining_balance || 0),
            subscriptionId: subscription.id,
          };
        })
        .filter((inv): inv is SubscriptionInvoice => inv !== null);

      setInvoices(subscriptionInvoices);

      // Calculer les statistiques
      const totalAmount = subscriptionInvoices.reduce((sum, inv) => sum + inv.monthlyAmount, 0);
      const paidAmount = subscriptionInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
      const pendingAmount = subscriptionInvoices.reduce(
        (sum, inv) => sum + inv.remainingBalance,
        0
      );

      setStats({
        totalInvoices: subscriptionInvoices.length,
        totalAmount,
        paidAmount,
        pendingAmount,
      });
    } catch (error: any) {
      console.error('Erreur lors du chargement des factures:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les factures d\'abonnement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: 'Payé', variant: 'default' as const },
      partial: { label: 'Partiel', variant: 'secondary' as const },
      unpaid: { label: 'Impayé', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'outline' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    {
      key: 'number',
      header: 'N° Facture',
      cell: (invoice: SubscriptionInvoice) => (
        <span className="font-medium">{invoice.number}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      cell: (invoice: SubscriptionInvoice) => (
        <span>{format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr })}</span>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      cell: (invoice: SubscriptionInvoice) => (
        <div>
          <div className="font-medium">{invoice.clientName}</div>
          <div className="text-sm text-muted-foreground">{invoice.clientPhone}</div>
        </div>
      ),
    },
    {
      key: 'service',
      header: 'Service',
      cell: (invoice: SubscriptionInvoice) => (
        <span className="text-sm">{invoice.serviceName}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Montant',
      cell: (invoice: SubscriptionInvoice) => (
        <span className="font-medium">
          {invoice.monthlyAmount.toLocaleString('fr-FR')} FCFA
        </span>
      ),
    },
    {
      key: 'paid',
      header: 'Payé',
      cell: (invoice: SubscriptionInvoice) => (
        <span className="text-green-600">
          {invoice.paidAmount.toLocaleString('fr-FR')} FCFA
        </span>
      ),
    },
    {
      key: 'remaining',
      header: 'Restant',
      cell: (invoice: SubscriptionInvoice) => (
        <span className="text-orange-600">
          {invoice.remainingBalance.toLocaleString('fr-FR')} FCFA
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Statut',
      cell: (invoice: SubscriptionInvoice) => getPaymentStatusBadge(invoice.paymentStatus),
    },
  ];

  const renderActions = (invoice: SubscriptionInvoice) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        window.location.href = `/invoices`;
      }}
    >
      <Eye className="h-4 w-4 mr-2" />
      Voir
    </Button>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Factures d'Abonnement
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestion et suivi des factures des abonnements internet
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Total Factures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Montant Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalAmount.toLocaleString('fr-FR')} FCFA
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Montant Payé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.paidAmount.toLocaleString('fr-FR')} FCFA
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
                En Attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingAmount.toLocaleString('fr-FR')} FCFA
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des factures */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Factures</CardTitle>
            <CardDescription>
              Toutes les factures générées pour les abonnements internet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={invoices}
              columns={columns}
              actions={renderActions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionInvoices;
