import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

interface CompanyInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  logo?: string;
}

interface TaxDeclaration {
  id: string;
  period_start: string;
  period_end: string;
  total_sales: number;
  total_purchases: number;
  vat_collected: number;
  vat_paid: number;
  vat_due: number;
  status: string;
  details?: {
    sales_by_rate?: Record<number, { amount: number; vat: number }>;
    purchases_by_rate?: Record<number, { amount: number; vat: number }>;
    invoices_count?: number;
    purchase_orders_count?: number;
  };
  created_at: string;
  submitted_at?: string;
}

export async function generateTaxDeclarationPDF(
  declaration: TaxDeclaration,
  companyInfo: CompanyInfo,
  signatureData?: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Add logo if available
  if (companyInfo.logo) {
    try {
      doc.addImage(companyInfo.logo, 'PNG', 15, yPos, 30, 30);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // Company header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name || 'Entreprise', pageWidth / 2, yPos + 10, { align: 'center' });
  
  yPos += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (companyInfo.address) {
    doc.text(companyInfo.address, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
  }
  if (companyInfo.phone || companyInfo.email) {
    const contact = [companyInfo.phone, companyInfo.email].filter(Boolean).join(' | ');
    doc.text(contact, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
  }
  if (companyInfo.tax_id) {
    doc.text(`N° Contribuable: ${companyInfo.tax_id}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
  }

  yPos += 10;

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉCLARATION DE TVA', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;

  // Period and reference
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const periodStart = format(new Date(declaration.period_start), 'dd MMMM yyyy', { locale: fr });
  const periodEnd = format(new Date(declaration.period_end), 'dd MMMM yyyy', { locale: fr });
  
  doc.text(`Période: Du ${periodStart} au ${periodEnd}`, 15, yPos);
  yPos += 7;
  doc.text(`Référence: ${declaration.id.substring(0, 8).toUpperCase()}`, 15, yPos);
  yPos += 7;
  doc.text(`Date de création: ${format(new Date(declaration.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}`, 15, yPos);
  yPos += 7;
  
  const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    submitted: 'Soumise',
    validated: 'Validée'
  };
  doc.text(`Statut: ${statusLabels[declaration.status] || declaration.status}`, 15, yPos);
  
  yPos += 15;

  // Summary section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ DE LA DÉCLARATION', 15, yPos);
  yPos += 10;

  // Summary table
  const summaryData = [
    ['Total des ventes (TTC)', formatCurrency(Number(declaration.total_sales))],
    ['Total des achats (TTC)', formatCurrency(Number(declaration.total_purchases))],
    ['TVA collectée', formatCurrency(Number(declaration.vat_collected))],
    ['TVA déductible', formatCurrency(Number(declaration.vat_paid))],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Désignation', 'Montant']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Net VAT Due
  doc.setFillColor(41, 128, 185);
  doc.rect(15, yPos, pageWidth - 30, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TVA À PAYER', 20, yPos + 8);
  doc.text(formatCurrency(Number(declaration.vat_due)), pageWidth - 20, yPos + 8, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  yPos += 20;

  // Breakdown by rate if available
  if (declaration.details?.sales_by_rate && Object.keys(declaration.details.sales_by_rate).length > 0) {
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAIL PAR TAUX DE TVA - VENTES', 15, yPos);
    yPos += 8;

    const salesBreakdown = Object.entries(declaration.details.sales_by_rate).map(([rate, data]) => [
      `${rate}%`,
      formatCurrency(data.amount),
      formatCurrency(data.vat)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Taux', 'Montant HT', 'TVA']],
      body: salesBreakdown,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
      styles: { fontSize: 10 },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Purchases breakdown
  if (declaration.details?.purchases_by_rate && Object.keys(declaration.details.purchases_by_rate).length > 0) {
    yPos += 5;
    
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAIL PAR TAUX DE TVA - ACHATS', 15, yPos);
    yPos += 8;

    const purchasesBreakdown = Object.entries(declaration.details.purchases_by_rate).map(([rate, data]) => [
      `${rate}%`,
      formatCurrency(data.amount),
      formatCurrency(data.vat)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Taux', 'Montant HT', 'TVA']],
      body: purchasesBreakdown,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
      styles: { fontSize: 10 },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Statistics
  if (declaration.details?.invoices_count !== undefined || declaration.details?.purchase_orders_count !== undefined) {
    yPos += 10;
    
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Documents traités: ${declaration.details.invoices_count || 0} facture(s), ${declaration.details.purchase_orders_count || 0} bon(s) de commande`, 15, yPos);
    yPos += 10;
  }

  // Signature section
  if (signatureData) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Signature électronique:', 15, yPos);
    yPos += 10;

    try {
      doc.addImage(signatureData, 'PNG', 15, yPos, 60, 30);
      yPos += 35;
    } catch (error) {
      console.error('Error adding signature:', error);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    if (declaration.submitted_at) {
      doc.text(
        `Signé électroniquement le ${format(new Date(declaration.submitted_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
        15,
        yPos
      );
    } else {
      doc.text(
        `Document signé électroniquement`,
        15,
        yPos
      );
    }
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Déclaration de TVA - Générée le ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`,
      15,
      doc.internal.pageSize.height - 10
    );
  }

  return doc;
}

export async function downloadTaxDeclarationPDF(
  declaration: TaxDeclaration,
  companyInfo: CompanyInfo,
  signatureData?: string
) {
  const doc = await generateTaxDeclarationPDF(declaration, companyInfo, signatureData);
  const fileName = `Declaration_TVA_${format(new Date(declaration.period_start), 'yyyy-MM')}_${declaration.id.substring(0, 8)}.pdf`;
  doc.save(fileName);
}