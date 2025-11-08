import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';
export type LogCategory = 'system' | 'auth' | 'api' | 'database' | 'ui' | 'business' | 'security';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
  userId?: string;
  userEmail?: string;
  source?: string;
  stackTrace?: string;
}

const MAX_LOGS = 1000;
const LOG_RETENTION_DAYS = 30;

export function useLogger() {
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('app_logs', []);
  const [enabled, setEnabled] = useLocalStorage('logging_enabled', true);

  const cleanOldLogs = useCallback((currentLogs: LogEntry[]) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - LOG_RETENTION_DAYS);
    
    return currentLogs
      .filter(log => new Date(log.timestamp) > cutoffDate)
      .slice(0, MAX_LOGS);
  }, []);

  const log = useCallback((
    level: LogLevel,
    category: LogCategory,
    message: string,
    details?: any,
    source?: string
  ) => {
    if (!enabled) return;

    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      source,
      stackTrace: level === 'error' ? new Error().stack : undefined
    };

    setLogs(prev => {
      const newLogs = [entry, ...prev];
      return cleanOldLogs(newLogs);
    });

    // Console output for development
    if (import.meta.env.DEV) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${level.toUpperCase()}] [${category}] ${message}`, details);
    }
  }, [enabled, setLogs, cleanOldLogs]);

  const debug = useCallback((category: LogCategory, message: string, details?: any, source?: string) => {
    log('debug', category, message, details, source);
  }, [log]);

  const info = useCallback((category: LogCategory, message: string, details?: any, source?: string) => {
    log('info', category, message, details, source);
  }, [log]);

  const warn = useCallback((category: LogCategory, message: string, details?: any, source?: string) => {
    log('warn', category, message, details, source);
  }, [log]);

  const error = useCallback((category: LogCategory, message: string, details?: any, source?: string) => {
    log('error', category, message, details, source);
  }, [log]);

  const success = useCallback((category: LogCategory, message: string, details?: any, source?: string) => {
    log('success', category, message, details, source);
  }, [log]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, [setLogs]);

  const clearOldLogs = useCallback(() => {
    setLogs(prev => cleanOldLogs(prev));
  }, [setLogs, cleanOldLogs]);

  const exportLogs = useCallback((filterLevel?: LogLevel, filterCategory?: LogCategory) => {
    let filteredLogs = logs;
    
    if (filterLevel) {
      filteredLogs = filteredLogs.filter(log => log.level === filterLevel);
    }
    
    if (filterCategory) {
      filteredLogs = filteredLogs.filter(log => log.category === filterCategory);
    }

    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `logs-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [logs]);

  const getLogStats = useCallback(() => {
    const stats = {
      total: logs.length,
      byLevel: {} as Record<LogLevel, number>,
      byCategory: {} as Record<LogCategory, number>,
      last24h: 0,
      last7d: 0
    };

    const now = new Date();
    const day24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const day7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    logs.forEach(log => {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      
      // Count by category
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      
      // Count recent logs
      const logDate = new Date(log.timestamp);
      if (logDate > day24h) stats.last24h++;
      if (logDate > day7d) stats.last7d++;
    });

    return stats;
  }, [logs]);

  const toggleLogging = useCallback(() => {
    setEnabled(prev => !prev);
  }, [setEnabled]);

  return {
    logs,
    enabled,
    log,
    debug,
    info,
    warn,
    error,
    success,
    clearLogs,
    clearOldLogs,
    exportLogs,
    getLogStats,
    toggleLogging
  };
}
