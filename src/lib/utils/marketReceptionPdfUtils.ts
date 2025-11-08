import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Market, MarketMilestone } from '@/hooks/useMarkets';

interface ReceptionReport {
  date: string;
  location: string;
  observations: string;
  reserves?: string;
  conformity: 'conforme' | 'non_conforme' | 'conforme_avec_reserves';
  attendees: Array<{
    name: string;
    role: string;
    entity: string;
  }>;
}

export async function generateMarketReceptionPDF(
  market: Market,
  milestones: MarketMilestone[],
  report: ReceptionReport,
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
  doc.text('PROCÈS-VERBAL DE RÉCEPTION', 105, yPos, { align: 'center' });
  yPos += 15;

  // Informations du marché
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MARCHÉ CONCERNÉ', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Référence: ${market.reference}`, 20, yPos);
  yPos += 6;
  doc.text(`Titre: ${market.title}`, 20, yPos);
  yPos += 6;
  if (market.clients) {
    doc.text(`Client: ${market.clients.name}`, 20, yPos);
    yPos += 6;
  }
  doc.text(`Date de réception: ${format(new Date(report.date), 'dd/MM/yyyy', { locale: fr })}`, 20, yPos);
  yPos += 6;
  doc.text(`Lieu: ${report.location}`, 20, yPos);
  yPos += 10;

  // Présents
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PERSONNES PRÉSENTES', 20, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [['Nom', 'Rôle', 'Entité']],
    body: report.attendees.map(a => [a.name, a.role, a.entity]),
    theme: 'grid',
    headStyles: { fillColor: [66, 66, 66] },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Récapitulatif des jalons
  if (milestones && milestones.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉCAPITULATIF DES JALONS', 20, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Jalon', 'Montant', 'Statut', 'Date de réalisation']],
      body: milestones.map(m => [
        m.title,
        `${Number(m.amount).toLocaleString('fr-FR')} FCFA`,
        m.status === 'completed' ? 'Terminé' : m.status === 'in_progress' ? 'En cours' : 'En attente',
        m.completion_date ? format(new Date(m.completion_date), 'dd/MM/yyyy', { locale: fr }) : '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66] },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Conformité
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFORMITÉ', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const conformityText = report.conformity === 'conforme' 
    ? 'Les travaux sont conformes aux spécifications du marché'
    : report.conformity === 'non_conforme'
    ? 'Les travaux ne sont pas conformes aux spécifications du marché'
    : 'Les travaux sont conformes sous réserves';
  
  doc.text(conformityText, 20, yPos);
  yPos += 10;

  // Observations
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('OBSERVATIONS', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const obsLines = doc.splitTextToSize(report.observations, 170);
  doc.text(obsLines, 20, yPos);
  yPos += obsLines.length * 5 + 10;

  // Réserves
  if (report.reserves) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉSERVES', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const resLines = doc.splitTextToSize(report.reserves, 170);
    doc.text(resLines, 20, yPos);
    yPos += resLines.length * 5 + 10;
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
  doc.text(`Fait à ${report.location}, le ${format(new Date(report.date), 'dd/MM/yyyy', { locale: fr })}`, 20, yPos);

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} sur ${pageCount} - PV Réception ${market.reference} - ${companyInfo.taxId || 'RC: XXXXXXX'}`,
      105,
      287,
      { align: 'center' }
    );
  }

  return doc;
}

export async function downloadMarketReceptionPDF(
  market: Market,
  milestones: MarketMilestone[],
  report: ReceptionReport,
  companyInfo: any,
  signatureData?: string
): Promise<void> {
  const doc = await generateMarketReceptionPDF(market, milestones, report, companyInfo, signatureData);
  doc.save(`PV_Reception_${market.reference}_${format(new Date(), 'yyyyMMdd')}.pdf`);
}
