import { useState, useCallback } from 'react';
import { SystemAnalyzer, SystemAnalysisReport } from '@/lib/diagnostics/systemAnalyzer';
import { useLogger } from './useLogger';
import { useToast } from '@/hooks/use-toast';

export function useSystemAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<SystemAnalysisReport | null>(null);
  const logger = useLogger();
  const { toast } = useToast();

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    logger.info('system', 'Démarrage de l\'analyse système complète');

    try {
      const analyzer = new SystemAnalyzer();
      const analysisReport = await analyzer.analyzeAllModules();
      
      setReport(analysisReport);
      logger.info('system', 'Analyse système terminée', {
        totalModules: analysisReport.totalModules,
        healthyModules: analysisReport.healthyModules,
        criticalIssues: analysisReport.criticalIssues,
      });

      if (analysisReport.criticalIssues === 0) {
        toast({
          title: "✅ Système sain",
          description: `${analysisReport.healthyModules}/${analysisReport.totalModules} modules fonctionnent correctement.`,
        });
      } else {
        toast({
          title: "⚠️ Problèmes détectés",
          description: `${analysisReport.criticalIssues} problème(s) trouvé(s) sur ${analysisReport.modulesWithIssues} module(s).`,
          variant: "destructive",
        });
      }

      return analysisReport;
    } catch (error) {
      logger.error('system', 'Erreur lors de l\'analyse système', error);
      toast({
        title: "❌ Erreur d'analyse",
        description: "Impossible d'analyser le système.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [logger, toast]);

  return {
    isAnalyzing,
    report,
    runAnalysis,
  };
}
