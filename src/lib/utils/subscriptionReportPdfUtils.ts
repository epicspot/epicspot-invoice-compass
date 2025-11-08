import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatFCFA } from '@/lib/utils';

interface SubscriptionInvoice {
  id: string;
  number: string;
  date: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  monthlyAmount: number;
  paidAmount: number;
  remainingBalance: number;
  paymentStatus: string;
}

interface ReportStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
}

export const generateSubscriptionReport = async (
  invoices: SubscriptionInvoice[],
  stats: ReportStats,
  period: { month?: string; year?: string },
  companyInfo: CompanyInfo
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // En-tête avec logo (si disponible)
  if (companyInfo.logo) {
    try {
      doc.addImage(companyInfo.logo, 'PNG', 15, yPos, 30, 30);
    } catch (error) {
      console.log('Logo non disponible');
    }
  }

  // Informations de l'entreprise
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, companyInfo.logo ? 50 : 15, yPos);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(companyInfo.address, companyInfo.logo ? 50 : 15, yPos + 7);
  doc.text(`Tél: ${companyInfo.phone}`, companyInfo.logo ? 50 : 15, yPos + 12);
  doc.text(`Email: ${companyInfo.email}`, companyInfo.logo ? 50 : 15, yPos + 17);

  yPos += 35;

  // Titre du rapport
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const title = 'RAPPORT DES ABONNEMENTS INTERNET';
  doc.text(title, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;

  // Période
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  let periodText = 'Période: ';
  if (period.month && period.year) {
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    periodText += `${monthNames[parseInt(period.month) - 1]} ${period.year}`;
  } else if (period.year) {
    periodText += `Année ${period.year}`;
  } else {
    periodText += 'Toutes les périodes';
  }
  doc.text(periodText, pageWidth / 2, yPos, { align: 'center' });

  yPos += 10;

  // Date de génération
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );

  yPos += 15;

  // Ligne de séparation
  doc.setLineWidth(0.5);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 10;

  // Statistiques
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ STATISTIQUES', 15, yPos);
  yPos += 8;

  // Tableau des statistiques
  const statsData = [
    ['Nombre total de factures', stats.totalInvoices.toString()],
    ['Montant total facturé', `${stats.totalAmount.toLocaleString('fr-FR')} FCFA`],
    ['Montant total payé', `${stats.paidAmount.toLocaleString('fr-FR')} FCFA`],
    ['Montant en attente', `${stats.pendingAmount.toLocaleString('fr-FR')} FCFA`],
    [
      'Taux de recouvrement',
      `${stats.totalAmount > 0 ? ((stats.paidAmount / stats.totalAmount) * 100).toFixed(2) : 0}%`
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indicateur', 'Valeur']],
    body: statsData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 75, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 15, right: 15 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Vérifier si on a besoin d'une nouvelle page
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }

  // Tableau des factures
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAIL DES FACTURES', 15, yPos);
  yPos += 8;

  if (invoices.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Aucune facture pour cette période.', 15, yPos);
  } else {
    const invoicesData = invoices.map((invoice) => [
      invoice.number,
      format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr }),
      invoice.clientName,
      invoice.serviceName,
      `${invoice.monthlyAmount.toLocaleString('fr-FR')} FCFA`,
      `${invoice.paidAmount.toLocaleString('fr-FR')} FCFA`,
      `${invoice.remainingBalance.toLocaleString('fr-FR')} FCFA`,
      invoice.paymentStatus === 'paid'
        ? 'Payé'
        : invoice.paymentStatus === 'partial'
        ? 'Partiel'
        : 'Impayé',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['N° Facture', 'Date', 'Client', 'Service', 'Montant', 'Payé', 'Restant', 'Statut']],
      body: invoicesData,
      theme: 'striped',
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 20 },
        2: { cellWidth: 30 },
        3: { cellWidth: 28 },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 22, halign: 'right' },
        7: { cellWidth: 18, halign: 'center' },
      },
      margin: { left: 15, right: 15 },
      didParseCell: (data) => {
        // Colorer le statut
        if (data.column.index === 7 && data.section === 'body') {
          const status = data.cell.raw as string;
          if (status === 'Payé') {
            data.cell.styles.textColor = [39, 174, 96];
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'Impayé') {
            data.cell.styles.textColor = [231, 76, 60];
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'Partiel') {
            data.cell.styles.textColor = [243, 156, 18];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });
  }

  // Pied de page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128);
    doc.text(
      `Page ${i} sur ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Rapport généré automatiquement - ${companyInfo.name}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Nom du fichier
  let fileName = 'rapport_abonnements';
  if (period.month && period.year) {
    fileName += `_${period.month}_${period.year}`;
  } else if (period.year) {
    fileName += `_${period.year}`;
  }
  fileName += '.pdf';

  // Sauvegarder le PDF
  doc.save(fileName);
};
