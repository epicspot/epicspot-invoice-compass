import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/lib/types';

export const generateInvoicePDF = (invoice: Invoice, companyInfo: any) => {
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

  // Titre FACTURE
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 200, 30, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoice.number}`, 200, 38, { align: 'right' });
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, 200, 44, { align: 'right' });

  yPosition = 60;

  // Informations client
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Facturé à:', 14, yPosition);
  yPosition += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.client.name, 14, yPosition);
  yPosition += 5;
  doc.text(invoice.client.address, 14, yPosition);
  yPosition += 5;
  doc.text(`Tél: ${invoice.client.phone}`, 14, yPosition);
  yPosition += 10;

  // Table des articles
  const tableData = invoice.items.map(item => [
    item.product.reference,
    item.product.description,
    item.product.price.toLocaleString() + ' FCFA',
    item.quantity.toString(),
    item.amount.toLocaleString() + ' FCFA'
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
  doc.text(`${invoice.subtotal.toLocaleString()} FCFA`, 200, yPosition, { align: 'right' });
  yPosition += 6;

  if (invoice.tax && invoice.tax > 0) {
    const taxAmount = (invoice.subtotal * invoice.tax) / 100;
    doc.text(`TVA (${invoice.tax}%):`, totalsX, yPosition);
    doc.text(`${taxAmount.toLocaleString()} FCFA`, 200, yPosition, { align: 'right' });
    yPosition += 6;
  }

  if (invoice.discount && invoice.discount > 0) {
    doc.text('Remise:', totalsX, yPosition);
    doc.text(`-${invoice.discount.toLocaleString()} FCFA`, 200, yPosition, { align: 'right' });
    yPosition += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, yPosition);
  doc.text(`${invoice.total.toLocaleString()} FCFA`, 200, yPosition, { align: 'right' });

  // Notes
  if (invoice.notes) {
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(invoice.notes, 180);
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
  doc.save(`Facture_${invoice.number}_${new Date().toISOString().split('T')[0]}.pdf`);
};
