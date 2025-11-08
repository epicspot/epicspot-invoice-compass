import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReportData {
  period: 'week' | 'month' | 'custom';
  customStartDate?: Date;
  customEndDate?: Date;
  generatedAt: Date;
  logs: {
    total: number;
    stats: any;
    recentLogs: any[];
  } | null;
  retries: {
    successRate: number;
    totalAttempts: number;
    successfulRetries: number;
    failedRetries: number;
    averageDuration: number;
    topErrors: any[];
    operationStats: any[];
    recentRetries: any[];
  } | null;
  performance: {
    stats: any;
    recentMetrics: any[];
  } | null;
}

export const generateSupervisionReport = async (data: ReportData) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text('Rapport de Supervision', 105, yPosition, { align: 'center' });
  yPosition += 10;

  // Period and date
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const periodText = data.period === 'week' ? 'Hebdomadaire' : data.period === 'month' ? 'Mensuel' : 'Personnalisé';
  let dateRangeText = periodText;
  if (data.period === 'custom' && data.customStartDate && data.customEndDate) {
    dateRangeText += ` (${format(data.customStartDate, 'dd/MM/yyyy', { locale: fr })} - ${format(data.customEndDate, 'dd/MM/yyyy', { locale: fr })})`;
  }
  doc.text(dateRangeText, 105, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text(`Généré le ${format(data.generatedAt, 'dd MMMM yyyy à HH:mm', { locale: fr })}`, 105, yPosition, { align: 'center' });
  yPosition += 15;

  // Summary section
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Résumé Exécutif', 14, yPosition);
  yPosition += 8;

  const summaryData = [];
  if (data.logs) {
    summaryData.push(['Total Logs', data.logs.total.toString()]);
    summaryData.push(['Erreurs', data.logs.stats.byLevel.error?.toString() || '0']);
    summaryData.push(['Avertissements', data.logs.stats.byLevel.warn?.toString() || '0']);
  }
  if (data.retries) {
    summaryData.push(['Taux de Succès Retry', `${data.retries.successRate.toFixed(1)}%`]);
    summaryData.push(['Tentatives Totales', data.retries.totalAttempts.toString()]);
  }
  if (data.performance) {
    summaryData.push(['Temps Navigation Moyen', `${Math.round(data.performance.stats.avgNavigationTime)}ms`]);
    summaryData.push(['Temps API Moyen', `${Math.round(data.performance.stats.avgApiTime)}ms`]);
  }

  autoTable(doc, {
    startY: yPosition,
    head: [['Métrique', 'Valeur']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Logs section
  if (data.logs && data.logs.recentLogs.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('Logs Récents', 14, yPosition);
    yPosition += 8;

    const logsData = data.logs.recentLogs.slice(0, 20).map(log => [
      format(new Date(log.timestamp), 'dd/MM HH:mm', { locale: fr }),
      log.level.toUpperCase(),
      log.category,
      log.message.substring(0, 50) + (log.message.length > 50 ? '...' : ''),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Niveau', 'Catégorie', 'Message']],
      body: logsData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Retry statistics
  if (data.retries && data.retries.topErrors.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('Top Erreurs de Retry', 14, yPosition);
    yPosition += 8;

    const errorsData = data.retries.topErrors.map(error => [
      error.code,
      error.count.toString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Code Erreur', 'Occurrences']],
      body: errorsData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Operation statistics
  if (data.retries && data.retries.operationStats.length > 0) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('Statistiques par Opération', 14, yPosition);
    yPosition += 8;

    const operationsData = data.retries.operationStats.map(op => [
      op.operation,
      op.attempts.toString(),
      op.successes.toString(),
      op.failures.toString(),
      `${op.successRate.toFixed(1)}%`,
      `${Math.round(op.avgDuration)}ms`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Opération', 'Tentatives', 'Succès', 'Échecs', 'Taux', 'Durée Moy.']],
      body: operationsData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Performance metrics
  if (data.performance && data.performance.recentMetrics.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('Métriques de Performance', 14, yPosition);
    yPosition += 8;

    const metricsData = data.performance.recentMetrics.slice(0, 20).map(metric => [
      format(new Date(metric.timestamp), 'dd/MM HH:mm', { locale: fr }),
      metric.type,
      metric.name.substring(0, 30) + (metric.name.length > 30 ? '...' : ''),
      `${Math.round(metric.duration)}ms`,
      metric.status || '-',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Type', 'Nom', 'Durée', 'Status']],
      body: metricsData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} sur ${pageCount} - Rapport généré le ${format(data.generatedAt, 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Download
  const filename = `rapport-supervision-${format(data.generatedAt, 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(filename);
};
