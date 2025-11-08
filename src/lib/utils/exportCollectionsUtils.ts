import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Collection } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatFCFA } from '@/lib/utils';

export interface CollectionExportData {
  collections: any[];
  stats: {
    totalThisMonth: number;
    totalLastMonth: number;
    percentChange: number;
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
    ['Recouvrements ce mois', formatFCFA(data.stats.totalThisMonth)],
    ['Évolution vs mois dernier', `${data.stats.percentChange >= 0 ? '+' : ''}${data.stats.percentChange.toFixed(1)}%`],
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
    .map(c => [
      format(new Date(c.createdAt), 'dd/MM/yyyy'),
      c.invoiceNumber || 'N/A',
      c.clientName || 'N/A',
      formatFCFA(c.amount),
      c.paymentMethod === 'cash' ? 'Espèces' : 
      c.paymentMethod === 'check' ? 'Chèque' :
      c.paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Virement',
    ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Date', 'Facture', 'Client', 'Montant', 'Mode de paiement']],
    body: recentCollections,
    theme: 'striped',
    headStyles: { fillColor: [14, 165, 233] },
    margin: { left: 14, right: 14 },
  });
  
  doc.save(`rapport-recouvrements-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportCollectionsExcel = (data: CollectionExportData) => {
  const workbook = XLSX.utils.book_new();
  
  // Feuille 1: KPIs
  const kpisData = [
    ['Indicateurs clés de performance'],
    [],
    ['Indicateur', 'Valeur'],
    ['Recouvrements ce mois', formatFCFA(data.stats.totalThisMonth)],
    ['Évolution vs mois dernier', `${data.stats.percentChange >= 0 ? '+' : ''}${data.stats.percentChange.toFixed(1)}%`],
    ['Taux de recouvrement', `${data.stats.collectionRate.toFixed(1)}%`],
  ];
  
  const kpisSheet = XLSX.utils.aoa_to_sheet(kpisData);
  XLSX.utils.book_append_sheet(workbook, kpisSheet, 'KPIs');
  
  // Feuille 2: Recouvrements
  const collectionsData = data.collections.map(c => ({
    Date: format(new Date(c.createdAt), 'dd/MM/yyyy'),
    Facture: c.invoiceNumber || 'N/A',
    Client: c.clientName || 'N/A',
    Montant: c.amount,
    'Mode de paiement': c.paymentMethod === 'cash' ? 'Espèces' : 
                        c.paymentMethod === 'check' ? 'Chèque' :
                        c.paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Virement',
    Collecteur: c.collectorName || 'N/A',
    Notes: c.notes || '',
  }));
  
  const collectionsSheet = XLSX.utils.json_to_sheet(collectionsData);
  XLSX.utils.book_append_sheet(workbook, collectionsSheet, 'Recouvrements');
  
  XLSX.writeFile(workbook, `rapport-recouvrements-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
