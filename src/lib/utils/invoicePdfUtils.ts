import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/lib/types';
import { formatFCFA } from '@/lib/utils';

export const generateInvoicePDF = async (invoice: Invoice, companyInfo: any) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Logo de l'entreprise (si disponible)
  if (companyInfo.logo) {
    try {
      const logoWidth = 40;
      const logoHeight = 20;
      doc.addImage(companyInfo.logo, 'PNG', 14, yPosition, logoWidth, logoHeight);
      yPosition += logoHeight + 5;
    } catch (error) {
      console.error('Erreur lors du chargement du logo:', error);
    }
  }

  // En-tête entreprise
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name || 'Entreprise', 14, yPosition);
  yPosition += 8;

  // Devise de l'entreprise
  if (companyInfo.slogan) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    doc.text(companyInfo.slogan, 14, yPosition);
    doc.setTextColor(0);
    yPosition += 6;
  }

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
  doc.setTextColor(0);
  doc.text('FACTURE', 200, 30, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoice.number}`, 200, 38, { align: 'right' });
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, 200, 44, { align: 'right' });

  yPosition = Math.max(yPosition, 60);

  // Informations client
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Facturé à:', 14, yPosition);
  yPosition += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (invoice.client) {
    doc.text(invoice.client.name || '-', 14, yPosition);
    yPosition += 5;
    if (invoice.client.address) {
      doc.text(invoice.client.address, 14, yPosition);
      yPosition += 5;
    }
    if (invoice.client.phone) {
      doc.text(`Tél: ${invoice.client.phone}`, 14, yPosition);
    }
  }
  yPosition += 10;

  // Table des articles
  const tableData = invoice.items.map(item => [
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
    styles: { 
      fontSize: 9,
      halign: 'left'
    },
    headStyles: { 
      fillColor: [41, 128, 185], 
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      2: { halign: 'right' }, // P.U
      3: { halign: 'center' }, // Qté
      4: { halign: 'right' } // Montant
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Totaux
  const totalsX = 140;
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Sous-total:', totalsX, yPosition);
  doc.text(formatFCFA(invoice.subtotal), 200, yPosition, { align: 'right' });
  yPosition += 6;

  if (invoice.tax && invoice.tax > 0) {
    const taxAmount = (invoice.subtotal * invoice.tax) / 100;
    doc.text(`TVA (${invoice.tax}%):`, totalsX, yPosition);
    doc.text(formatFCFA(taxAmount), 200, yPosition, { align: 'right' });
    yPosition += 6;
  }

  if (invoice.discount && invoice.discount > 0) {
    doc.text('Remise:', totalsX, yPosition);
    doc.text(`-${formatFCFA(invoice.discount)}`, 200, yPosition, { align: 'right' });
    yPosition += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, yPosition);
  doc.text(formatFCFA(invoice.total), 200, yPosition, { align: 'right' });

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

  // Section signatures
  const pageHeight = doc.internal.pageSize.height;
  const signatureY = pageHeight - 60;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  
  // Signature client
  doc.text('Signature Client', 30, signatureY);
  doc.line(15, signatureY + 20, 85, signatureY + 20);
  
  // Signature entreprise
  doc.text('Signature Entreprise', 135, signatureY);
  doc.line(125, signatureY + 20, 195, signatureY + 20);
  
  if (companyInfo.signatory) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(companyInfo.signatory, 160, signatureY + 25, { align: 'center' });
    if (companyInfo.signatory_title) {
      doc.setFont('helvetica', 'italic');
      doc.text(companyInfo.signatory_title, 160, signatureY + 30, { align: 'center' });
    }
  }

  // Pied de page
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Merci pour votre confiance', 105, pageHeight - 14, { align: 'center' });
  
  if (companyInfo.taxId) {
    doc.text(companyInfo.taxId, 105, pageHeight - 9, { align: 'center' });
  }

  // Sauvegarder
  doc.save(`Facture_${invoice.number}_${new Date().toISOString().split('T')[0]}.pdf`);
};
