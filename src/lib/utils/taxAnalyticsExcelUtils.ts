import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

interface MonthlyData {
  month: string;
  vatCollected: number;
  vatPaid: number;
  vatDue: number;
  previousYearVatDue: number;
}

interface VATRateDistribution {
  rate: string;
  vatCollected: number;
  vatPaid: number;
  net: number;
}

interface YearSummary {
  current: {
    totalSales: number;
    totalPurchases: number;
    vatCollected: number;
    vatPaid: number;
    vatDue: number;
    declarationsCount: number;
  };
  previous: {
    vatDue: number;
  };
  vatDueChange: number;
}

interface CompanyInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
}

export function exportTaxAnalyticsToExcel(
  monthlyData: MonthlyData[],
  vatRateDistribution: VATRateDistribution[],
  yearSummary: YearSummary,
  selectedYear: number,
  comparisonYear: number,
  companyInfo: CompanyInfo
) {
  const wb = XLSX.utils.book_new();

  // === Sheet 1: Résumé Annuel ===
  const summaryData = [
    [`ANALYSE TVA ${selectedYear}`, '', '', ''],
    [companyInfo.name || 'Entreprise', '', '', ''],
    [`Rapport généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, '', '', ''],
    ['', '', '', ''],
    ['RÉSUMÉ ANNUEL', '', '', ''],
    ['', '', '', ''],
    ['Indicateur', `${selectedYear}`, `${comparisonYear}`, 'Variation'],
    ['Total des Ventes TTC', formatCurrency(yearSummary.current.totalSales), '', ''],
    ['Total des Achats TTC', formatCurrency(yearSummary.current.totalPurchases), '', ''],
    ['TVA Collectée', formatCurrency(yearSummary.current.vatCollected), '', ''],
    ['TVA Déductible', formatCurrency(yearSummary.current.vatPaid), '', ''],
    ['TVA à Payer', formatCurrency(yearSummary.current.vatDue), formatCurrency(yearSummary.previous.vatDue), `${yearSummary.vatDueChange.toFixed(1)}%`],
    ['Nombre de Déclarations', yearSummary.current.declarationsCount.toString(), '', ''],
    ['', '', '', ''],
    ['MOYENNES MENSUELLES', '', '', ''],
    ['', '', '', ''],
    ['Moyenne TVA à Payer', formatCurrency(yearSummary.current.vatDue / 12), formatCurrency(yearSummary.previous.vatDue / 12), ''],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);

  // Styling for summary sheet
  ws1['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 }
  ];

  // Merge cells for title
  ws1['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } },
    { s: { r: 14, c: 0 }, e: { r: 14, c: 3 } }
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Résumé Annuel');

  // === Sheet 2: Évolution Mensuelle ===
  const monthlyDataFormatted = [
    [`ÉVOLUTION MENSUELLE ${selectedYear}`, '', '', '', ''],
    ['', '', '', '', ''],
    ['Mois', 'TVA Collectée', 'TVA Déductible', 'TVA à Payer', `TVA à Payer ${comparisonYear}`],
    ...monthlyData.map(m => [
      m.month,
      m.vatCollected,
      m.vatPaid,
      m.vatDue,
      m.previousYearVatDue
    ]),
    ['', '', '', '', ''],
    ['TOTAUX', 
      monthlyData.reduce((sum, m) => sum + m.vatCollected, 0),
      monthlyData.reduce((sum, m) => sum + m.vatPaid, 0),
      monthlyData.reduce((sum, m) => sum + m.vatDue, 0),
      monthlyData.reduce((sum, m) => sum + m.previousYearVatDue, 0)
    ]
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(monthlyDataFormatted);

  ws2['!cols'] = [
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 }
  ];

  ws2['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }
  ];

  // Format numbers
  const numFormat = '#,##0.00';
  for (let row = 3; row < monthlyDataFormatted.length + 3; row++) {
    for (let col = 1; col <= 4; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (ws2[cellRef]) {
        ws2[cellRef].z = numFormat;
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws2, 'Évolution Mensuelle');

  // === Sheet 3: Répartition par Taux ===
  const rateData = [
    [`RÉPARTITION PAR TAUX DE TVA ${selectedYear}`, '', '', ''],
    ['', '', '', ''],
    ['Taux', 'TVA Collectée', 'TVA Déductible', 'Solde Net'],
    ...vatRateDistribution.map(r => [
      r.rate,
      r.vatCollected,
      r.vatPaid,
      r.net
    ]),
    ['', '', '', ''],
    ['TOTAUX',
      vatRateDistribution.reduce((sum, r) => sum + r.vatCollected, 0),
      vatRateDistribution.reduce((sum, r) => sum + r.vatPaid, 0),
      vatRateDistribution.reduce((sum, r) => sum + r.net, 0)
    ],
    ['', '', '', ''],
    ['', '', '', ''],
    ['ANALYSE PAR TAUX', '', '', ''],
    ['', '', '', ''],
    ['Taux', 'Part TVA Collectée', 'Part TVA Déductible', 'Taux Moyen Effectif'],
  ];

  const totalCollected = vatRateDistribution.reduce((sum, r) => sum + r.vatCollected, 0);
  const totalPaid = vatRateDistribution.reduce((sum, r) => sum + r.vatPaid, 0);

  vatRateDistribution.forEach(r => {
    rateData.push([
      r.rate,
      totalCollected > 0 ? `${((r.vatCollected / totalCollected) * 100).toFixed(2)}%` : '0%',
      totalPaid > 0 ? `${((r.vatPaid / totalPaid) * 100).toFixed(2)}%` : '0%',
      r.vatCollected > 0 ? `${((r.net / r.vatCollected) * 100).toFixed(2)}%` : '0%'
    ]);
  });

  const ws3 = XLSX.utils.aoa_to_sheet(rateData);

  ws3['!cols'] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 }
  ];

  ws3['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 3 } }
  ];

  // Format numbers in rate sheet
  for (let row = 3; row < 3 + vatRateDistribution.length + 1; row++) {
    for (let col = 1; col <= 3; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (ws3[cellRef]) {
        ws3[cellRef].z = numFormat;
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws3, 'Répartition par Taux');

  // === Sheet 4: Données Brutes (pour graphiques Excel) ===
  const rawData = [
    ['DONNÉES BRUTES POUR GRAPHIQUES', '', '', ''],
    ['', '', '', ''],
    ['Mois', 'TVA Collectée', 'TVA Déductible', 'TVA à Payer'],
    ...monthlyData.map(m => [
      m.month,
      m.vatCollected,
      m.vatPaid,
      m.vatDue
    ])
  ];

  const ws4 = XLSX.utils.aoa_to_sheet(rawData);
  ws4['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  ws4['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

  XLSX.utils.book_append_sheet(wb, ws4, 'Données Brutes');

  // === Sheet 5: Notes et Méthodologie ===
  const notesData = [
    ['NOTES ET MÉTHODOLOGIE', '', ''],
    ['', '', ''],
    ['1. DÉFINITIONS', '', ''],
    ['', '', ''],
    ['TVA Collectée', ':', 'TVA facturée sur les ventes aux clients'],
    ['TVA Déductible', ':', 'TVA payée sur les achats auprès des fournisseurs'],
    ['TVA à Payer', ':', 'TVA Collectée - TVA Déductible'],
    ['', '', ''],
    ['2. CALCULS', '', ''],
    ['', '', ''],
    ['Variation Annuelle', ':', `((TVA ${selectedYear} - TVA ${comparisonYear}) / TVA ${comparisonYear}) × 100`],
    ['Moyenne Mensuelle', ':', 'Total Annuel / 12'],
    ['Part par Taux', ':', '(TVA Taux / Total TVA) × 100'],
    ['', '', ''],
    ['3. SOURCES', '', ''],
    ['', '', ''],
    ['Données extraites des', ':', 'Déclarations de TVA validées et soumises'],
    ['Période analysée', ':', `Année ${selectedYear}`],
    ['Période de comparaison', ':', `Année ${comparisonYear}`],
    ['Date de génération', ':', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })],
    ['', '', ''],
    ['4. INFORMATIONS ENTREPRISE', '', ''],
    ['', '', ''],
    ['Raison sociale', ':', companyInfo.name || 'Non renseignée'],
    ['Adresse', ':', companyInfo.address || 'Non renseignée'],
    ['Téléphone', ':', companyInfo.phone || 'Non renseigné'],
    ['Email', ':', companyInfo.email || 'Non renseigné'],
    ['N° Contribuable', ':', companyInfo.tax_id || 'Non renseigné'],
  ];

  const ws5 = XLSX.utils.aoa_to_sheet(notesData);
  ws5['!cols'] = [{ wch: 25 }, { wch: 3 }, { wch: 50 }];
  ws5['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 2 } },
    { s: { r: 14, c: 0 }, e: { r: 14, c: 2 } },
    { s: { r: 21, c: 0 }, e: { r: 21, c: 2 } }
  ];

  XLSX.utils.book_append_sheet(wb, ws5, 'Notes et Méthodologie');

  // Generate and download file
  const fileName = `Analyse_TVA_${selectedYear}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportQuickTaxSummary(
  monthlyData: MonthlyData[],
  selectedYear: number,
  companyInfo: CompanyInfo
) {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    [`RÉSUMÉ TVA ${selectedYear}`, '', ''],
    [companyInfo.name || 'Entreprise', '', ''],
    ['', '', ''],
    ['Mois', 'TVA Collectée', 'TVA à Payer'],
    ...monthlyData.map(m => [
      m.month,
      m.vatCollected,
      m.vatDue
    ]),
    ['', '', ''],
    ['TOTAL',
      monthlyData.reduce((sum, m) => sum + m.vatCollected, 0),
      monthlyData.reduce((sum, m) => sum + m.vatDue, 0)
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  ws['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 18 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }
  ];

  XLSX.utils.book_append_sheet(wb, ws, `Résumé ${selectedYear}`);

  const fileName = `Resume_TVA_${selectedYear}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}