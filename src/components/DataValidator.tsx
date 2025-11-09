import { useEffect, useState } from 'react';
import { useDataValidator } from '@/hooks/useDataValidator';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle2, AlertTriangle, Wrench, XCircle } from 'lucide-react';

export function DataValidator() {
  const { isValidating, report, validateAll } = useDataValidator();
  const [lastValidation, setLastValidation] = useLocalStorage('last_validation_date', '');
  const [showDialog, setShowDialog] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    // Valider au démarrage si la dernière validation date de plus de 24h
    const shouldValidate = () => {
      if (!lastValidation) return true;
      
      const lastDate = new Date(lastValidation);
      const now = new Date();
      const hoursSinceLastValidation = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
      
      return hoursSinceLastValidation > 24;
    };

    if (shouldValidate()) {
      setShowDialog(true);
      handleValidate();
    }
  }, []);

  const handleValidate = async () => {
    try {
      await validateAll();
      setLastValidation(new Date().toISOString());
      setShowReport(true);
    } catch (error) {
      console.error('Erreur de validation:', error);
    }
  };

  const getStatusIcon = () => {
    if (!report) return null;
    
    if (report.criticalIssues.length === 0 && report.warnings.length === 0) {
      return <CheckCircle2 className="h-12 w-12 text-green-500" />;
    } else if (report.criticalIssues.length === 0) {
      return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    } else if (report.repairedItems > 0) {
      return <Wrench className="h-12 w-12 text-blue-500" />;
    } else {
      return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    if (!report) return '';
    
    if (report.criticalIssues.length === 0 && report.warnings.length === 0) {
      return 'Toutes les données sont valides !';
    } else if (report.criticalIssues.length === 0) {
      return `${report.warnings.length} avertissement(s) détecté(s)`;
    } else if (report.repairedItems > 0) {
      return `${report.repairedItems} élément(s) réparé(s) automatiquement`;
    } else {
      return `${report.criticalIssues.length} erreur(s) critique(s) détectée(s)`;
    }
  };

  return (
    <>
      {/* Dialog de validation en cours */}
      <Dialog open={showDialog && isValidating} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="animate-spin">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              Validation des données
            </DialogTitle>
            <DialogDescription>
              Vérification de l'intégrité de la base de données en cours...
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Progress value={isValidating ? undefined : 100} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Cette opération peut prendre quelques instants
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog du rapport de validation */}
      <Dialog open={showReport && !isValidating} onOpenChange={setShowReport}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {getStatusIcon()}
              <span>Rapport de validation</span>
            </DialogTitle>
            <DialogDescription>
              {getStatusMessage()}
            </DialogDescription>
          </DialogHeader>

          {report && (
            <div className="space-y-4">
              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-sm text-muted-foreground">Vérifications totales</p>
                  <p className="text-2xl font-bold">{report.totalChecks}</p>
                </div>
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-sm text-muted-foreground">Éléments réparés</p>
                  <p className="text-2xl font-bold text-blue-500">{report.repairedItems}</p>
                </div>
              </div>

              {/* Erreurs critiques */}
              {report.criticalIssues.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <h4 className="font-semibold">Erreurs critiques</h4>
                    <Badge variant="destructive">{report.criticalIssues.length}</Badge>
                  </div>
                  <ScrollArea className="h-32 rounded-lg border p-3">
                    <div className="space-y-2">
                      {report.criticalIssues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Avertissements */}
              {report.warnings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <h4 className="font-semibold">Avertissements</h4>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      {report.warnings.length}
                    </Badge>
                  </div>
                  <ScrollArea className="h-32 rounded-lg border p-3">
                    <div className="space-y-2">
                      {report.warnings.map((warning, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Message de succès */}
              {report.criticalIssues.length === 0 && report.warnings.length === 0 && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100">
                        Base de données saine
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Aucun problème détecté. Toutes les données sont valides.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowReport(false)}>
                  Fermer
                </Button>
                <Button onClick={handleValidate} disabled={isValidating}>
                  Relancer la validation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
