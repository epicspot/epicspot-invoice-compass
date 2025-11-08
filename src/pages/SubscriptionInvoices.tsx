import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FileText, Download, Eye, Calendar, DollarSign, User, X, FileDown, Mail } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateSubscriptionReport } from '@/lib/utils/subscriptionReportPdfUtils';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import ManualInvoiceGeneration from '@/components/ManualInvoiceGeneration';

interface SubscriptionInvoice {
  id: string;
  number: string;
  date: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceName: string;
  monthlyAmount: number;
  status: string;
  paymentStatus: string;
  paidAmount: number;
  remainingBalance: number;
  subscriptionId: string;
}

const SubscriptionInvoices = () => {
  const { companyInfo } = useCompanyInfo();
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });

  // Générer les options de mois
  const months = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' },
  ];

  // Générer les années (5 dernières années)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      // Récupérer les factures d'abonnement
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
          subscription_id,
          client_id,
          clients!inner(id, name, phone, email),
          subscriptions!inner(id, service_name, monthly_amount)
        `)
        .eq('invoice_type', 'subscription')
        .not('subscription_id', 'is', null)
        .order('date', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Mapper les factures
      const subscriptionInvoices = (invoicesData || [])
        .map((invoice: any) => {
          const subscription = invoice.subscriptions;
          
          if (!subscription) {
            console.warn('Invoice without subscription:', invoice.id);
            return null;
          }

          return {
            id: invoice.id,
            number: invoice.number,
            date: invoice.date,
            clientId: invoice.client_id,
            clientName: invoice.clients?.name || 'N/A',
            clientPhone: invoice.clients?.phone || 'N/A',
            clientEmail: invoice.clients?.email || undefined,
            serviceName: subscription.service_name,
            monthlyAmount: parseFloat(String(subscription.monthly_amount)),
            status: invoice.status,
            paymentStatus: invoice.payment_status,
            paidAmount: parseFloat(invoice.paid_amount || 0),
            remainingBalance: parseFloat(invoice.remaining_balance || 0),
            subscriptionId: subscription.id,
          } as SubscriptionInvoice;
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

  // Filtrer les factures par période
  const filteredInvoices = invoices.filter((invoice) => {
    if (selectedMonth === 'all' && selectedYear === 'all') return true;

    const invoiceDate = parseISO(invoice.date);
    const invoiceMonth = format(invoiceDate, 'MM');
    const invoiceYear = format(invoiceDate, 'yyyy');

    const monthMatch = selectedMonth === 'all' || invoiceMonth === selectedMonth;
    const yearMatch = selectedYear === 'all' || invoiceYear === selectedYear;

    return monthMatch && yearMatch;
  });

  // Recalculer les statistiques basées sur les factures filtrées
  useEffect(() => {
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.monthlyAmount, 0);
    const paidAmount = filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const pendingAmount = filteredInvoices.reduce((sum, inv) => sum + inv.remainingBalance, 0);

    setStats({
      totalInvoices: filteredInvoices.length,
      totalAmount,
      paidAmount,
      pendingAmount,
    });
  }, [filteredInvoices]);

  const resetFilters = () => {
    setSelectedMonth('all');
    setSelectedYear('all');
  };

  const hasActiveFilters = selectedMonth !== 'all' || selectedYear !== 'all';

  const handleSendEmailReminder = async (invoice: SubscriptionInvoice) => {
    if (!invoice.clientEmail) {
      toast({
        title: "Email manquant",
        description: `Le client ${invoice.clientName} n'a pas d'adresse email enregistrée`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-invoice-email-reminder', {
        body: {
          invoiceId: invoice.id,
          clientEmail: invoice.clientEmail,
          clientName: invoice.clientName,
          invoiceNumber: invoice.number,
          amount: invoice.remainingBalance,
          dueDate: invoice.date,
        },
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: `Un rappel de paiement a été envoyé à ${invoice.clientName}`,
      });
    } catch (error) {
      console.error('Error sending email reminder:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer l'email de rappel",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingPdf(true);
    
    try {
      await generateSubscriptionReport(
        filteredInvoices,
        stats,
        {
          month: selectedMonth === 'all' ? undefined : selectedMonth,
          year: selectedYear === 'all' ? undefined : selectedYear,
        },
        {
          name: companyInfo.name || 'Entreprise',
          address: companyInfo.address || '',
          phone: companyInfo.phone || '',
          email: companyInfo.email || '',
        }
      );

      toast({
        title: "Rapport généré",
        description: "Le rapport PDF a été téléchargé avec succès.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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
    <div className="flex gap-2">
      {invoice.paymentStatus !== 'paid' && invoice.clientEmail && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSendEmailReminder(invoice)}
        >
          <Mail className="h-4 w-4 mr-1" />
          Rappel
        </Button>
      )}
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
    </div>
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
          <Button
            onClick={handleGenerateReport}
            disabled={isGeneratingPdf || filteredInvoices.length === 0}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            {isGeneratingPdf ? 'Génération...' : 'Générer Rapport PDF'}
          </Button>
        </div>

        {/* Génération manuelle */}
        <ManualInvoiceGeneration />

        {/* Filtres par période */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtrer par période
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Mois</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les mois" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les mois</SelectItem>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Année</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les années" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" onClick={resetFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Réinitialiser
                </Button>
              )}
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Filtres actifs:</span>
                {selectedMonth !== 'all' && (
                  <Badge variant="secondary">
                    {months.find((m) => m.value === selectedMonth)?.label}
                  </Badge>
                )}
                {selectedYear !== 'all' && <Badge variant="secondary">{selectedYear}</Badge>}
              </div>
            )}
          </CardContent>
        </Card>

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
              {hasActiveFilters
                ? `${filteredInvoices.length} facture(s) pour la période sélectionnée`
                : 'Toutes les factures générées pour les abonnements internet'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredInvoices}
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
