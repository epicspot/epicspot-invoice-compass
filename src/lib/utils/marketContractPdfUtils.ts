import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Market } from '@/hooks/useMarkets';

export async function generateMarketContractPDF(
  market: Market,
  companyInfo: any,
  signatureData?: string
): Promise<jsPDF> {
  const doc = new jsPDF();
  let yPos = 20;

  // En-tête de l'entreprise
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name || 'EPICSPOT_CONSULTING', 105, yPos, { align: 'center' });
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(companyInfo.address || 'Abidjan, Côte d\'Ivoire', 105, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Tél: ${companyInfo.phone || '+225 XX XX XX XX'}`, 105, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Email: ${companyInfo.email || 'contact@epicspot.com'}`, 105, yPos, { align: 'center' });
  yPos += 15;

  // Titre
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRAT DE MARCHÉ', 105, yPos, { align: 'center' });
  yPos += 15;

  // Informations du marché
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS DU MARCHÉ', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Référence: ${market.reference}`, 20, yPos);
  yPos += 6;
  doc.text(`Titre: ${market.title}`, 20, yPos);
  yPos += 6;
  doc.text(`Type: ${market.type === 'public' ? 'Public' : market.type === 'private' ? 'Privé' : 'Accord-cadre'}`, 20, yPos);
  yPos += 6;
  
  if (market.start_date) {
    doc.text(`Date de début: ${format(new Date(market.start_date), 'dd/MM/yyyy', { locale: fr })}`, 20, yPos);
    yPos += 6;
  }
  
  if (market.end_date) {
    doc.text(`Date de fin: ${format(new Date(market.end_date), 'dd/MM/yyyy', { locale: fr })}`, 20, yPos);
    yPos += 6;
  }
  yPos += 5;

  // Client
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (market.clients) {
    doc.text(`Nom: ${market.clients.name}`, 20, yPos);
    yPos += 6;
    if (market.clients.code) {
      doc.text(`Code: ${market.clients.code}`, 20, yPos);
      yPos += 6;
    }
  }
  yPos += 5;

  // Montants
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MONTANTS', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Montant estimé: ${market.estimated_amount.toLocaleString('fr-FR')} FCFA`, 20, yPos);
  yPos += 6;
  doc.text(`Montant réel: ${market.actual_amount.toLocaleString('fr-FR')} FCFA`, 20, yPos);
  yPos += 6;

  if (market.deposit_percentage && market.deposit_percentage > 0) {
    doc.text(`Acompte: ${market.deposit_percentage}% (${(market.deposit_amount || 0).toLocaleString('fr-FR')} FCFA)`, 20, yPos);
    yPos += 6;
  }
  yPos += 5;

  // Conditions
  if (market.payment_terms || market.delivery_terms) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDITIONS', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (market.payment_terms) {
      doc.text('Conditions de paiement:', 20, yPos);
      yPos += 6;
      const paymentLines = doc.splitTextToSize(market.payment_terms, 170);
      doc.text(paymentLines, 20, yPos);
      yPos += paymentLines.length * 5 + 5;
    }

    if (market.delivery_terms) {
      doc.text('Conditions de livraison:', 20, yPos);
      yPos += 6;
      const deliveryLines = doc.splitTextToSize(market.delivery_terms, 170);
      doc.text(deliveryLines, 20, yPos);
      yPos += deliveryLines.length * 5 + 5;
    }
  }

  // Description
  if (market.description) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(market.description, 170);
    doc.text(descLines, 20, yPos);
    yPos += descLines.length * 5 + 10;
  }

  // Signatures
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SIGNATURES', 20, yPos);
  yPos += 15;

  // Signature du prestataire
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Le Prestataire', 20, yPos);
  doc.text('Le Client', 120, yPos);
  yPos += 5;

  if (signatureData) {
    try {
      doc.addImage(signatureData, 'PNG', 20, yPos, 60, 20);
    } catch (error) {
      console.error('Error adding signature:', error);
    }
  }

  yPos += 25;
  doc.text(`Date: ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`, 20, yPos);

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} sur ${pageCount} - ${companyInfo.taxId || 'RC: XXXXXXX - IF: XXXXXXX'}`,
      105,
      287,
      { align: 'center' }
    );
  }

  return doc;
}

export async function downloadMarketContractPDF(
  market: Market,
  companyInfo: any,
  signatureData?: string
): Promise<void> {
  const doc = await generateMarketContractPDF(market, companyInfo, signatureData);
  doc.save(`Contrat_${market.reference}_${format(new Date(), 'yyyyMMdd')}.pdf`);
}
