import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface RetryStats {
  totalAttempts: number;
  successfulRetries: number;
  failedRetries: number;
  totalDuration: number;
  averageDuration: number;
  errorsByCode: Record<string, number>;
  errorsByOperation: Record<string, {
    attempts: number;
    successes: number;
    failures: number;
    totalDuration: number;
  }>;
  recentRetries: Array<{
    timestamp: number;
    operation: string;
    success: boolean;
    attempts: number;
    duration: number;
    errorCode?: string;
  }>;
}

const INITIAL_STATS: RetryStats = {
  totalAttempts: 0,
  successfulRetries: 0,
  failedRetries: 0,
  totalDuration: 0,
  averageDuration: 0,
  errorsByCode: {},
  errorsByOperation: {},
  recentRetries: [],
};

const MAX_RECENT_RETRIES = 100;

export const useRetryMonitoring = () => {
  const [stats, setStats] = useLocalStorage<RetryStats>('retry-monitoring-stats', INITIAL_STATS);
  const [isEnabled, setIsEnabled] = useLocalStorage('retry-monitoring-enabled', true);

  const recordRetry = useCallback((
    operation: string,
    success: boolean,
    attempts: number,
    duration: number,
    errorCode?: string
  ) => {
    if (!isEnabled) return;

    setStats((prev) => {
      const newStats = { ...prev };

      // Update totals
      newStats.totalAttempts += attempts;
      if (success) {
        newStats.successfulRetries += 1;
      } else {
        newStats.failedRetries += 1;
      }
      newStats.totalDuration += duration;
      newStats.averageDuration = newStats.totalDuration / (newStats.successfulRetries + newStats.failedRetries);

      // Update errors by code
      if (errorCode) {
        newStats.errorsByCode[errorCode] = (newStats.errorsByCode[errorCode] || 0) + 1;
      }

      // Update errors by operation
      if (!newStats.errorsByOperation[operation]) {
        newStats.errorsByOperation[operation] = {
          attempts: 0,
          successes: 0,
          failures: 0,
          totalDuration: 0,
        };
      }
      const opStats = newStats.errorsByOperation[operation];
      opStats.attempts += attempts;
      opStats.totalDuration += duration;
      if (success) {
        opStats.successes += 1;
      } else {
        opStats.failures += 1;
      }

      // Add to recent retries
      newStats.recentRetries = [
        {
          timestamp: Date.now(),
          operation,
          success,
          attempts,
          duration,
          errorCode,
        },
        ...newStats.recentRetries,
      ].slice(0, MAX_RECENT_RETRIES);

      return newStats;
    });
  }, [isEnabled, setStats]);

  const clearStats = useCallback(() => {
    setStats(INITIAL_STATS);
  }, [setStats]);

  const toggleMonitoring = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, [setIsEnabled]);

  const getSuccessRate = useCallback(() => {
    const total = stats.successfulRetries + stats.failedRetries;
    return total > 0 ? (stats.successfulRetries / total) * 100 : 0;
  }, [stats]);

  const getTopErrors = useCallback((limit = 5) => {
    return Object.entries(stats.errorsByCode)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([code, count]) => ({ code, count }));
  }, [stats]);

  const getOperationStats = useCallback(() => {
    return Object.entries(stats.errorsByOperation)
      .map(([operation, data]) => ({
        operation,
        ...data,
        successRate: data.attempts > 0 ? (data.successes / (data.successes + data.failures)) * 100 : 0,
        avgDuration: data.attempts > 0 ? data.totalDuration / data.attempts : 0,
      }))
      .sort((a, b) => (b.successes + b.failures) - (a.successes + a.failures));
  }, [stats]);

  return {
    stats,
    isEnabled,
    recordRetry,
    clearStats,
    toggleMonitoring,
    getSuccessRate,
    getTopErrors,
    getOperationStats,
  };
};
