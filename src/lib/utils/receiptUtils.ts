import jsPDF from 'jspdf';
import { Invoice, Client } from '@/lib/types';

interface ReceiptData {
  receiptNumber: string;
  date: string;
  client: Client;
  amount: number;
  paymentMethod: string;
  paymentDetails?: string;
  invoiceNumber?: string;
  items?: Array<{
    description: string;
    quantity: number;
    price: number;
    amount: number;
  }>;
  notes?: string;
}

export const generateReceipt = (data: ReceiptData, companyInfo?: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // En-tête entreprise
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo?.name || 'EPICSPOT_CONSULTING', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (companyInfo?.address) {
    doc.text(companyInfo.address, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
  }
  if (companyInfo?.phone) {
    doc.text(`Tél: ${companyInfo.phone}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
  }
  if (companyInfo?.taxId) {
    doc.text(`N° Fiscal: ${companyInfo.taxId}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
  }

  yPosition += 10;

  // Titre QUITTANCE
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('QUITTANCE', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Numéro et date
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${data.receiptNumber}`, 14, yPosition);
  doc.text(`Date: ${new Date(data.date).toLocaleDateString('fr-FR')}`, pageWidth - 14, yPosition, { align: 'right' });
  yPosition += 10;

  // Ligne de séparation
  doc.setLineWidth(0.5);
  doc.line(14, yPosition, pageWidth - 14, yPosition);
  yPosition += 10;

  // Informations client
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT:', 14, yPosition);
  yPosition += 6;

  doc.setFont('helvetica', 'normal');
  doc.text(data.client.name, 14, yPosition);
  yPosition += 5;
  
  if (data.client.address && data.client.address !== '-') {
    doc.text(data.client.address, 14, yPosition);
    yPosition += 5;
  }
  
  if (data.client.phone && data.client.phone !== '-') {
    doc.text(`Tél: ${data.client.phone}`, 14, yPosition);
    yPosition += 5;
  }

  yPosition += 5;

  // Ligne de séparation
  doc.line(14, yPosition, pageWidth - 14, yPosition);
  yPosition += 10;

  // Détails du paiement
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS DU PAIEMENT:', 14, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  
  if (data.invoiceNumber) {
    doc.text(`Facture N°: ${data.invoiceNumber}`, 14, yPosition);
    yPosition += 6;
  }

  doc.text(`Mode de paiement: ${data.paymentMethod}`, 14, yPosition);
  yPosition += 6;

  if (data.paymentDetails) {
    const details = data.paymentDetails.split('\n');
    details.forEach(detail => {
      doc.text(detail, 14, yPosition);
      yPosition += 6;
    });
  }

  yPosition += 5;

  // Articles (si disponibles)
  if (data.items && data.items.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('ARTICLES:', 14, yPosition);
    yPosition += 8;

    // En-têtes du tableau
    doc.setFontSize(9);
    doc.text('Description', 14, yPosition);
    doc.text('Qté', 120, yPosition, { align: 'right' });
    doc.text('P.U.', 150, yPosition, { align: 'right' });
    doc.text('Montant', pageWidth - 14, yPosition, { align: 'right' });
    yPosition += 2;
    
    doc.line(14, yPosition, pageWidth - 14, yPosition);
    yPosition += 5;

    // Lignes du tableau
    doc.setFont('helvetica', 'normal');
    data.items.forEach(item => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(item.description.substring(0, 50), 14, yPosition);
      doc.text(String(item.quantity), 120, yPosition, { align: 'right' });
      doc.text(`${item.price.toLocaleString()}`, 150, yPosition, { align: 'right' });
      doc.text(`${item.amount.toLocaleString()}`, pageWidth - 14, yPosition, { align: 'right' });
      yPosition += 6;
    });

    yPosition += 2;
    doc.line(14, yPosition, pageWidth - 14, yPosition);
    yPosition += 8;
  }

  // Montant total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MONTANT PAYÉ:', 14, yPosition);
  doc.text(`${data.amount.toLocaleString()} FCFA`, pageWidth - 14, yPosition, { align: 'right' });
  yPosition += 10;

  // Montant en lettres (simple approximation)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Arrêté la présente quittance à la somme de ${data.amount.toLocaleString()} Francs CFA`, 14, yPosition);
  yPosition += 10;

  // Notes
  if (data.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 28);
    doc.text(splitNotes, 14, yPosition);
    yPosition += splitNotes.length * 5;
  }

  // Pied de page
  yPosition = doc.internal.pageSize.height - 40;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Signature
  doc.text('Signature et cachet', pageWidth - 60, yPosition);
  yPosition += 20;
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text(`Quittance générée le ${new Date().toLocaleString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });

  // Sauvegarder le PDF
  doc.save(`Quittance_${data.receiptNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateReceiptFromInvoice = (invoice: Invoice, paymentData: any, companyInfo?: any) => {
  const paymentMethod = paymentData.method === 'cash' 
    ? 'Espèces' 
    : paymentData.method === 'card' 
    ? 'Carte bancaire' 
    : 'Chèque';

  let paymentDetails = '';
  if (paymentData.method === 'card') {
    paymentDetails = `Transaction: ${paymentData.cardTransactionNumber}`;
    if (paymentData.cardTerminal) {
      paymentDetails += `\nTerminal: ${paymentData.cardTerminal}`;
    }
  } else if (paymentData.method === 'check') {
    paymentDetails = `Chèque N°: ${paymentData.checkNumber}`;
    paymentDetails += `\nBanque: ${paymentData.checkBank}`;
    paymentDetails += `\nDate: ${new Date(paymentData.checkDate).toLocaleDateString('fr-FR')}`;
  } else if (paymentData.method === 'cash' && paymentData.amount > invoice.total) {
    paymentDetails = `Montant reçu: ${paymentData.amount.toLocaleString()} FCFA`;
    paymentDetails += `\nRendu: ${(paymentData.amount - invoice.total).toLocaleString()} FCFA`;
  }

  generateReceipt({
    receiptNumber: `QUIT-${invoice.number}`,
    date: new Date().toISOString(),
    client: invoice.client,
    amount: invoice.total,
    paymentMethod,
    paymentDetails,
    invoiceNumber: invoice.number,
    items: invoice.items.map(item => ({
      description: item.product.description,
      quantity: item.quantity,
      price: item.product.price,
      amount: item.amount
    })),
    notes: paymentData.notes
  }, companyInfo);
};
