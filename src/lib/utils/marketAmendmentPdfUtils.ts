import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Market } from '@/hooks/useMarkets';

interface Amendment {
  number: string;
  date: string;
  reason: string;
  changes: string;
  previousAmount?: number;
  newAmount?: number;
}

export async function generateMarketAmendmentPDF(
  market: Market,
  amendment: Amendment,
  companyInfo: any,
  signatureData?: string
): Promise<jsPDF> {
  const doc = new jsPDF();
  let yPos = 20;

  // En-tête
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name || 'EPICSPOT_CONSULTING', 105, yPos, { align: 'center' });
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(companyInfo.address || 'Abidjan, Côte d\'Ivoire', 105, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Tél: ${companyInfo.phone || '+225 XX XX XX XX'}`, 105, yPos, { align: 'center' });
  yPos += 15;

  // Titre
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AVENANT AU MARCHÉ', 105, yPos, { align: 'center' });
  yPos += 15;

  // Informations de l'avenant
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS DE L\'AVENANT', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Numéro d'avenant: ${amendment.number}`, 20, yPos);
  yPos += 6;
  doc.text(`Date: ${format(new Date(amendment.date), 'dd/MM/yyyy', { locale: fr })}`, 20, yPos);
  yPos += 6;
  doc.text(`Marché de référence: ${market.reference}`, 20, yPos);
  yPos += 10;

  // Motif
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MOTIF DE L\'AVENANT', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const reasonLines = doc.splitTextToSize(amendment.reason, 170);
  doc.text(reasonLines, 20, yPos);
  yPos += reasonLines.length * 5 + 10;

  // Modifications
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MODIFICATIONS APPORTÉES', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const changesLines = doc.splitTextToSize(amendment.changes, 170);
  doc.text(changesLines, 20, yPos);
  yPos += changesLines.length * 5 + 10;

  // Montants si modifiés
  if (amendment.previousAmount !== undefined && amendment.newAmount !== undefined) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('MODIFICATION DES MONTANTS', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Montant initial: ${amendment.previousAmount.toLocaleString('fr-FR')} FCFA`, 20, yPos);
    yPos += 6;
    doc.text(`Nouveau montant: ${amendment.newAmount.toLocaleString('fr-FR')} FCFA`, 20, yPos);
    yPos += 6;
    const difference = amendment.newAmount - amendment.previousAmount;
    doc.text(`Différence: ${difference >= 0 ? '+' : ''}${difference.toLocaleString('fr-FR')} FCFA`, 20, yPos);
    yPos += 10;
  }

  // Signatures
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SIGNATURES', 20, yPos);
  yPos += 15;

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
      `Page ${i} sur ${pageCount} - Avenant ${amendment.number} - ${companyInfo.taxId || 'RC: XXXXXXX'}`,
      105,
      287,
      { align: 'center' }
    );
  }

  return doc;
}

export async function downloadMarketAmendmentPDF(
  market: Market,
  amendment: Amendment,
  companyInfo: any,
  signatureData?: string
): Promise<void> {
  const doc = await generateMarketAmendmentPDF(market, amendment, companyInfo, signatureData);
  doc.save(`Avenant_${amendment.number}_${market.reference}_${format(new Date(), 'yyyyMMdd')}.pdf`);
}
