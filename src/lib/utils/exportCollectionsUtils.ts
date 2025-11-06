import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Collection, Vendor } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface CollectionExportData {
  collections: Collection[];
  vendors: Vendor[];
  stats: {
    totalThisMonth: number;
    totalLastMonth: number;
    percentChange: number;
    activeVendors: number;
    totalDebt: number;
    collectionRate: number;
  };
}

export const exportCollectionsPDF = (data: CollectionExportData, companyInfo?: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // En-tête
  doc.setFontSize(20);
  doc.text('Rapport de Recouvrements', pageWidth / 2, 20, { align: 'center' });
  
  if (companyInfo?.name) {
    doc.setFontSize(10);
    doc.text(companyInfo.name, pageWidth / 2, 28, { align: 'center' });
  }
  
  doc.setFontSize(10);
  doc.text(`Date d'édition: ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`, pageWidth / 2, 35, { align: 'center' });
  
  let yPos = 45;
  
  // Section KPIs
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Indicateurs clés', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const kpis = [
    ['Recouvrements ce mois', `${data.stats.totalThisMonth.toLocaleString()} FCFA`],
    ['Évolution vs mois dernier', `${data.stats.percentChange >= 0 ? '+' : ''}${data.stats.percentChange.toFixed(1)}%`],
    ['Vendeurs actifs', `${data.stats.activeVendors}`],
    ['Solde à recouvrer', `${data.stats.totalDebt.toLocaleString()} FCFA`],
    ['Taux de recouvrement', `${data.stats.collectionRate.toFixed(1)}%`],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Indicateur', 'Valeur']],
    body: kpis,
    theme: 'grid',
    headStyles: { fillColor: [14, 165, 233] },
    margin: { left: 14, right: 14 },
  });
  
  // Section Recouvrements récents
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recouvrements récents', 14, yPos);
  yPos += 10;
  
  const recentCollections = data.collections
    .slice(0, 20)
    .map(c => {
      const vendor = data.vendors.find(v => v.id === c.vendorId);
      return [
        format(new Date(c.collectionDate), 'dd/MM/yyyy'),
        vendor?.name || 'N/A',
        `${c.amount.toLocaleString()} FCFA`,
        c.paymentMethod === 'cash' ? 'Espèces' : 
        c.paymentMethod === 'check' ? 'Chèque' :
        c.paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Virement',
      ];
    });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Date', 'Vendeur', 'Montant', 'Mode de paiement']],
    body: recentCollections,
    theme: 'striped',
    headStyles: { fillColor: [14, 165, 233] },
    margin: { left: 14, right: 14 },
  });
  
  // Section Vendeurs avec soldes
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Vendeurs avec soldes impayés', 14, yPos);
  yPos += 10;
  
  const vendorsWithDebt = data.vendors
    .filter(v => v.remainingBalance > 0)
    .sort((a, b) => b.remainingBalance - a.remainingBalance)
    .map(v => [
      v.name,
      v.phone,
      `${v.totalDebt.toLocaleString()} FCFA`,
      `${v.paidAmount.toLocaleString()} FCFA`,
      `${v.remainingBalance.toLocaleString()} FCFA`,
    ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Vendeur', 'Téléphone', 'Dette totale', 'Payé', 'Reste']],
    body: vendorsWithDebt,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    margin: { left: 14, right: 14 },
  });
  
  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`rapport-recouvrements-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportCollectionsExcel = (data: CollectionExportData) => {
  const workbook = XLSX.utils.book_new();
  
  // Feuille 1: KPIs
  const kpisData = [
    ['Indicateurs clés de performance'],
    [],
    ['Indicateur', 'Valeur'],
    ['Recouvrements ce mois', `${data.stats.totalThisMonth.toLocaleString()} FCFA`],
    ['Évolution vs mois dernier', `${data.stats.percentChange >= 0 ? '+' : ''}${data.stats.percentChange.toFixed(1)}%`],
    ['Vendeurs actifs', data.stats.activeVendors],
    ['Solde à recouvrer', `${data.stats.totalDebt.toLocaleString()} FCFA`],
    ['Taux de recouvrement', `${data.stats.collectionRate.toFixed(1)}%`],
  ];
  
  const kpisSheet = XLSX.utils.aoa_to_sheet(kpisData);
  XLSX.utils.book_append_sheet(workbook, kpisSheet, 'KPIs');
  
  // Feuille 2: Recouvrements
  const collectionsData = data.collections.map(c => {
    const vendor = data.vendors.find(v => v.id === c.vendorId);
    return {
      Date: format(new Date(c.collectionDate), 'dd/MM/yyyy'),
      Vendeur: vendor?.name || 'N/A',
      'Téléphone vendeur': vendor?.phone || 'N/A',
      Montant: c.amount,
      'Mode de paiement': c.paymentMethod === 'cash' ? 'Espèces' : 
                          c.paymentMethod === 'check' ? 'Chèque' :
                          c.paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Virement',
      Collecteur: c.collectorId,
      Notes: c.notes || '',
    };
  });
  
  const collectionsSheet = XLSX.utils.json_to_sheet(collectionsData);
  XLSX.utils.book_append_sheet(workbook, collectionsSheet, 'Recouvrements');
  
  // Feuille 3: Vendeurs
  const vendorsData = data.vendors.map(v => ({
    Nom: v.name,
    Téléphone: v.phone,
    Email: v.email || '',
    Site: v.siteId,
    'Dette totale': v.totalDebt,
    'Montant payé': v.paidAmount,
    'Solde restant': v.remainingBalance,
    'Taux de paiement': v.totalDebt > 0 ? `${((v.paidAmount / v.totalDebt) * 100).toFixed(1)}%` : '0%',
    Statut: v.active ? 'Actif' : 'Inactif',
  }));
  
  const vendorsSheet = XLSX.utils.json_to_sheet(vendorsData);
  XLSX.utils.book_append_sheet(workbook, vendorsSheet, 'Vendeurs');
  
  // Feuille 4: Alertes (vendeurs avec soldes)
  const alertsData = data.vendors
    .filter(v => v.remainingBalance > 0)
    .sort((a, b) => b.remainingBalance - a.remainingBalance)
    .map(v => ({
      Vendeur: v.name,
      Téléphone: v.phone,
      'Dette totale': v.totalDebt,
      'Montant payé': v.paidAmount,
      'Reste à payer': v.remainingBalance,
      'Priorité': v.remainingBalance > 100000 ? 'HAUTE' : v.remainingBalance > 50000 ? 'MOYENNE' : 'BASSE',
    }));
  
  const alertsSheet = XLSX.utils.json_to_sheet(alertsData);
  XLSX.utils.book_append_sheet(workbook, alertsSheet, 'Alertes');
  
  XLSX.writeFile(workbook, `rapport-recouvrements-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
