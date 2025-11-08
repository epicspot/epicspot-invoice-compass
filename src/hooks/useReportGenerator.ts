import { useCallback } from 'react';
import { useLogger } from './useLogger';
import { useRetryMonitoring } from './useRetryMonitoring';
import { usePerformanceMetrics } from './usePerformanceMetrics';
import { generateSupervisionReport } from '@/lib/utils/reportPdfUtils';
import { useToast } from '@/hooks/use-toast';

export type ReportPeriod = 'week' | 'month' | 'custom';

interface ReportConfig {
  period: ReportPeriod;
  customStartDate?: Date;
  customEndDate?: Date;
  includeLogs: boolean;
  includeRetries: boolean;
  includePerformance: boolean;
}

export const useReportGenerator = () => {
  const logger = useLogger();
  const { stats: retryStats, getSuccessRate, getTopErrors, getOperationStats } = useRetryMonitoring();
  const { getStats: getPerformanceStats, metrics: performanceMetrics } = usePerformanceMetrics();
  const { toast } = useToast();

  const filterDataByPeriod = useCallback((timestamp: number, period: ReportPeriod, customStart?: Date, customEnd?: Date) => {
    const now = Date.now();
    const itemDate = timestamp;

    if (period === 'custom' && customStart && customEnd) {
      return itemDate >= customStart.getTime() && itemDate <= customEnd.getTime();
    }

    const periodMs = period === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    return now - itemDate <= periodMs;
  }, []);

  const generateReport = useCallback(async (config: ReportConfig) => {
    try {
      const logStats = logger.getLogStats();
      const performanceStats = getPerformanceStats();
      const retrySuccessRate = getSuccessRate();
      const topErrors = getTopErrors(10);
      const operationStats = getOperationStats();

      // Filter logs by period
      const filteredLogs = logger.logs.filter(log => 
        filterDataByPeriod(Number(log.timestamp), config.period, config.customStartDate, config.customEndDate)
      );

      // Filter retries by period
      const filteredRetries = retryStats.recentRetries.filter(retry =>
        filterDataByPeriod(retry.timestamp, config.period, config.customStartDate, config.customEndDate)
      );

      // Filter performance metrics by period
      const filteredMetrics = performanceMetrics.filter(metric =>
        filterDataByPeriod(Number(metric.timestamp), config.period, config.customStartDate, config.customEndDate)
      );

      const reportData = {
        period: config.period,
        customStartDate: config.customStartDate,
        customEndDate: config.customEndDate,
        generatedAt: new Date(),
        logs: config.includeLogs ? {
          total: filteredLogs.length,
          stats: logStats,
          recentLogs: filteredLogs.slice(0, 50),
        } : null,
        retries: config.includeRetries ? {
          successRate: retrySuccessRate,
          totalAttempts: retryStats.totalAttempts,
          successfulRetries: retryStats.successfulRetries,
          failedRetries: retryStats.failedRetries,
          averageDuration: retryStats.averageDuration,
          topErrors,
          operationStats: operationStats.slice(0, 10),
          recentRetries: filteredRetries.slice(0, 30),
        } : null,
        performance: config.includePerformance ? {
          stats: performanceStats,
          recentMetrics: filteredMetrics.slice(0, 50),
        } : null,
      };

      await generateSupervisionReport(reportData);

      toast({
        title: "Rapport généré",
        description: "Le rapport PDF a été téléchargé avec succès.",
      });

      logger.log('success', 'system', 'Rapport de supervision généré', { period: config.period });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport.",
        variant: "destructive",
      });
      logger.log('error', 'system', 'Erreur lors de la génération du rapport', { error });
    }
  }, [logger, retryStats, getSuccessRate, getTopErrors, getOperationStats, getPerformanceStats, performanceMetrics, filterDataByPeriod, toast]);

  return {
    generateReport,
  };
};
