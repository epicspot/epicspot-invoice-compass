import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useLogger } from './useLogger';

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  type: 'navigation' | 'api' | 'render' | 'resource';
  name: string;
  duration: number;
  status?: 'success' | 'error';
  details?: any;
}

export interface PerformanceStats {
  metrics: PerformanceMetric[];
  avgNavigationTime: number;
  avgApiTime: number;
  avgRenderTime: number;
  totalApiCalls: number;
  failedApiCalls: number;
  slowestOperations: Array<{ name: string; duration: number; type: string }>;
}

const MAX_METRICS = 1000;
const METRICS_RETENTION_DAYS = 7;

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useLocalStorage<PerformanceMetric[]>('performance_metrics', []);
  const [enabled, setEnabled] = useLocalStorage('performance_monitoring_enabled', true);
  const logger = useLogger();

  const cleanOldMetrics = useCallback((currentMetrics: PerformanceMetric[]) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - METRICS_RETENTION_DAYS);
    
    return currentMetrics
      .filter(metric => new Date(metric.timestamp) > cutoffDate)
      .slice(0, MAX_METRICS);
  }, []);

  const recordMetric = useCallback((
    type: PerformanceMetric['type'],
    name: string,
    duration: number,
    status?: 'success' | 'error',
    details?: any
  ) => {
    if (!enabled) return;

    const metric: PerformanceMetric = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      name,
      duration,
      status,
      details
    };

    setMetrics(prev => {
      const newMetrics = [metric, ...prev];
      return cleanOldMetrics(newMetrics);
    });

    logger.debug('system', `Performance metric recorded: ${name}`, {
      type,
      duration: Math.round(duration),
      status
    });
  }, [enabled, setMetrics, cleanOldMetrics, logger]);

  const getStats = useCallback((): PerformanceStats => {
    const navigationMetrics = metrics.filter(m => m.type === 'navigation');
    const apiMetrics = metrics.filter(m => m.type === 'api');
    const renderMetrics = metrics.filter(m => m.type === 'render');

    const avgNavigationTime = navigationMetrics.length > 0
      ? navigationMetrics.reduce((sum, m) => sum + m.duration, 0) / navigationMetrics.length
      : 0;

    const avgApiTime = apiMetrics.length > 0
      ? apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length
      : 0;

    const avgRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length
      : 0;

    const totalApiCalls = apiMetrics.length;
    const failedApiCalls = apiMetrics.filter(m => m.status === 'error').length;

    const slowestOperations = [...metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(m => ({ name: m.name, duration: m.duration, type: m.type }));

    return {
      metrics,
      avgNavigationTime,
      avgApiTime,
      avgRenderTime,
      totalApiCalls,
      failedApiCalls,
      slowestOperations
    };
  }, [metrics]);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
    logger.info('system', 'Performance metrics cleared');
  }, [setMetrics, logger]);

  const toggleMonitoring = useCallback(() => {
    setEnabled(prev => !prev);
    logger.info('system', `Performance monitoring ${!enabled ? 'enabled' : 'disabled'}`);
  }, [setEnabled, enabled, logger]);

  // Monitor navigation performance
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          recordMetric(
            'navigation',
            'Page Load',
            navEntry.loadEventEnd - navEntry.fetchStart,
            'success',
            { type: navEntry.type }
          );
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      console.warn('Performance observer not supported');
    }

    return () => observer.disconnect();
  }, [enabled, recordMetric]);

  return {
    metrics,
    enabled,
    recordMetric,
    getStats,
    clearMetrics,
    toggleMonitoring
  };
}
