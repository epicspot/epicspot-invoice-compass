import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote } from '@/lib/types';
import { formatFCFA } from '@/lib/utils';

export const generateQuotePDF = (quote: Quote, companyInfo: any) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // En-tête entreprise
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name || 'Entreprise', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (companyInfo.address) {
    doc.text(companyInfo.address, 14, yPosition);
    yPosition += 5;
  }
  if (companyInfo.phone) {
    doc.text(`Tél: ${companyInfo.phone}`, 14, yPosition);
    yPosition += 5;
  }
  if (companyInfo.email) {
    doc.text(`Email: ${companyInfo.email}`, 14, yPosition);
    yPosition += 5;
  }

  // Titre DEVIS
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', 200, 30, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${quote.number}`, 200, 38, { align: 'right' });
  doc.text(`Date: ${new Date(quote.date).toLocaleDateString('fr-FR')}`, 200, 44, { align: 'right' });

  yPosition = 60;

  // Informations client
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', 14, yPosition);
  yPosition += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (quote.client) {
    doc.text(quote.client.name || '-', 14, yPosition);
    yPosition += 5;
    if (quote.client.address) {
      doc.text(quote.client.address, 14, yPosition);
      yPosition += 5;
    }
    if (quote.client.phone) {
      doc.text(`Tél: ${quote.client.phone}`, 14, yPosition);
    }
  }
  yPosition += 10;

  // Table des articles
  const tableData = quote.items.map(item => [
    item.product?.reference || '-',
    item.product?.description || 'Article',
    formatFCFA(item.product?.price || 0),
    item.quantity.toString(),
    formatFCFA(item.amount)
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Référence', 'Description', 'P.U', 'Qté', 'Montant']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Totaux
  const totalsX = 140;
  doc.setFontSize(10);
  
  doc.text('Sous-total:', totalsX, yPosition);
  doc.text(formatFCFA(quote.subtotal), 200, yPosition, { align: 'right' });
  yPosition += 6;

  if (quote.discount && quote.discount > 0) {
    doc.text('Remise:', totalsX, yPosition);
    doc.text(`-${formatFCFA(quote.discount)}`, 200, yPosition, { align: 'right' });
    yPosition += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, yPosition);
  doc.text(formatFCFA(quote.total), 200, yPosition, { align: 'right' });

  // Notes
  if (quote.notes) {
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(quote.notes, 180);
    doc.text(splitNotes, 14, yPosition);
    yPosition += splitNotes.length * 5;
  }

  // Slogan en bas de page
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100);
  
  if (companyInfo.slogan) {
    doc.text(companyInfo.slogan, 105, pageHeight - 20, { align: 'center' });
  }
  
  doc.setFont('helvetica', 'normal');
  doc.text('Merci pour votre confiance', 105, pageHeight - 14, { align: 'center' });
  
  if (companyInfo.taxId) {
    doc.text(companyInfo.taxId, 105, pageHeight - 9, { align: 'center' });
  }

  // Sauvegarder
  doc.save(`Devis_${quote.number}_${new Date().toISOString().split('T')[0]}.pdf`);
};
