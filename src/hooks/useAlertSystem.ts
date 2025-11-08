import { useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useLogger } from './useLogger';
import { useRetryMonitoring } from './useRetryMonitoring';
import { useToast } from './use-toast';

export interface AlertConfig {
  enabled: boolean;
  criticalErrorsOnly: boolean;
  errorThreshold: number; // nombre d'erreurs par minute
  retryFailureThreshold: number; // pourcentage d'échec
  performanceThreshold: number; // temps de réponse en ms
  checkInterval: number; // intervalle de vérification en ms
}

const DEFAULT_CONFIG: AlertConfig = {
  enabled: true,
  criticalErrorsOnly: false,
  errorThreshold: 5, // 5 erreurs par minute
  retryFailureThreshold: 50, // 50% d'échec
  performanceThreshold: 3000, // 3 secondes
  checkInterval: 60000, // 1 minute
};

export function useAlertSystem() {
  const [config, setConfig] = useLocalStorage<AlertConfig>('alert-system-config', DEFAULT_CONFIG);
  const logger = useLogger();
  const retryMonitoring = useRetryMonitoring();
  const { toast } = useToast();
  const lastCheckRef = useRef<number>(Date.now());
  const alertedIssuesRef = useRef<Set<string>>(new Set());

  const checkErrorRate = useCallback(() => {
    if (!config.enabled) return;

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentErrors = logger.logs.filter(log => 
      log.level === 'error' && 
      new Date(log.timestamp).getTime() > oneMinuteAgo
    );

    const criticalErrors = recentErrors.filter(log => 
      log.message.toLowerCase().includes('critical') ||
      log.message.toLowerCase().includes('fatal') ||
      log.category === 'security'
    );

    // Alerte pour erreurs critiques
    if (criticalErrors.length > 0 && !alertedIssuesRef.current.has('critical-error')) {
      alertedIssuesRef.current.add('critical-error');
      
      toast({
        title: '⚠️ Erreur Critique Détectée',
        description: `${criticalErrors.length} erreur(s) critique(s) détectée(s). Consultez les logs pour plus de détails.`,
        variant: 'destructive',
      });

      logger.error('system', 'Critical error alert triggered', {
        count: criticalErrors.length,
        errors: criticalErrors.map(e => e.message)
      });

      // Reset l'alerte après 5 minutes
      setTimeout(() => {
        alertedIssuesRef.current.delete('critical-error');
      }, 300000);
    }

    // Alerte pour taux d'erreur élevé
    if (!config.criticalErrorsOnly && recentErrors.length >= config.errorThreshold) {
      const alertKey = `high-error-rate-${Math.floor(now / 60000)}`;
      
      if (!alertedIssuesRef.current.has(alertKey)) {
        alertedIssuesRef.current.add(alertKey);
        
        toast({
          title: '⚠️ Taux d\'Erreur Élevé',
          description: `${recentErrors.length} erreurs détectées dans la dernière minute.`,
          variant: 'destructive',
        });

        logger.warn('system', 'High error rate alert triggered', {
          count: recentErrors.length,
          threshold: config.errorThreshold
        });

        // Reset l'alerte après 5 minutes
        setTimeout(() => {
          alertedIssuesRef.current.delete(alertKey);
        }, 300000);
      }
    }
  }, [config, logger, toast]);

  const checkRetryFailures = useCallback(() => {
    if (!config.enabled) return;

    const successRate = retryMonitoring.getSuccessRate();
    const failureRate = 100 - successRate;
    const totalRetries = retryMonitoring.stats.successfulRetries + retryMonitoring.stats.failedRetries;

    // Seulement alerter s'il y a assez de données
    if (totalRetries >= 5 && failureRate >= config.retryFailureThreshold) {
      const alertKey = 'high-retry-failure';
      
      if (!alertedIssuesRef.current.has(alertKey)) {
        alertedIssuesRef.current.add(alertKey);
        
        toast({
          title: '⚠️ Taux d\'Échec Retry Élevé',
          description: `${failureRate.toFixed(1)}% des tentatives échouent. Vérifiez la connectivité.`,
          variant: 'destructive',
        });

        logger.warn('system', 'High retry failure rate alert triggered', {
          failureRate: failureRate.toFixed(1),
          threshold: config.retryFailureThreshold,
          totalRetries
        });

        // Reset l'alerte après 10 minutes
        setTimeout(() => {
          alertedIssuesRef.current.delete(alertKey);
        }, 600000);
      }
    }
  }, [config, retryMonitoring, toast, logger]);

  const checkTopErrors = useCallback(() => {
    if (!config.enabled) return;

    const topErrors = retryMonitoring.getTopErrors(3);
    
    topErrors.forEach(({ code, count }) => {
      if (count >= 10) { // Seuil de 10 occurrences
        const alertKey = `frequent-error-${code}`;
        
        if (!alertedIssuesRef.current.has(alertKey)) {
          alertedIssuesRef.current.add(alertKey);
          
          toast({
            title: '⚠️ Erreur Récurrente Détectée',
            description: `L'erreur ${code} s'est produite ${count} fois.`,
            variant: 'destructive',
          });

          logger.warn('system', 'Frequent error alert triggered', {
            errorCode: code,
            count
          });

          // Reset l'alerte après 15 minutes
          setTimeout(() => {
            alertedIssuesRef.current.delete(alertKey);
          }, 900000);
        }
      }
    });
  }, [config, retryMonitoring, toast, logger]);

  const runAllChecks = useCallback(() => {
    const now = Date.now();
    
    // Vérifier si assez de temps s'est écoulé depuis la dernière vérification
    if (now - lastCheckRef.current >= config.checkInterval) {
      checkErrorRate();
      checkRetryFailures();
      checkTopErrors();
      lastCheckRef.current = now;
    }
  }, [config.checkInterval, checkErrorRate, checkRetryFailures, checkTopErrors]);

  const updateConfig = useCallback((updates: Partial<AlertConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    logger.info('system', 'Alert system configuration updated', updates);
  }, [setConfig, logger]);

  const clearAlerts = useCallback(() => {
    alertedIssuesRef.current.clear();
    logger.info('system', 'Alert history cleared');
  }, [logger]);

  // Vérification périodique
  useEffect(() => {
    if (!config.enabled) return;

    const interval = setInterval(runAllChecks, config.checkInterval);

    return () => clearInterval(interval);
  }, [config.enabled, config.checkInterval, runAllChecks]);

  // Vérification immédiate quand de nouvelles données arrivent
  useEffect(() => {
    if (!config.enabled) return;

    // Vérifier quand de nouveaux logs arrivent
    const recentLog = logger.logs[0];
    if (recentLog && recentLog.level === 'error') {
      checkErrorRate();
    }
  }, [logger.logs, config.enabled, checkErrorRate]);

  useEffect(() => {
    if (!config.enabled) return;

    // Vérifier quand de nouvelles tentatives arrivent
    const recentRetry = retryMonitoring.stats.recentRetries[0];
    if (recentRetry && !recentRetry.success) {
      checkRetryFailures();
      checkTopErrors();
    }
  }, [retryMonitoring.stats.recentRetries, config.enabled, checkRetryFailures, checkTopErrors]);

  return {
    config,
    updateConfig,
    clearAlerts,
    runAllChecks,
  };
}
