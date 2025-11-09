import { useState } from 'react';
import { useSystemAnalyzer } from '@/hooks/useSystemAnalyzer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Activity,
  Database,
  FileEdit,
  Trash2,
  Eye,
  Plus
} from 'lucide-react';

export function SystemAnalyzer() {
  const { isAnalyzing, report, runAnalysis } = useSystemAnalyzer();
  const [open, setOpen] = useState(false);

  const handleAnalyze = async () => {
    await runAnalysis();
  };

  const getCRUDIcon = (enabled: boolean) => {
    return enabled ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getModuleStatusColor = (module: any) => {
    if (module.issues.length > 0) return 'border-red-500';
    if (module.warnings.length > 0 || module.missingFeatures.length > 0) return 'border-yellow-500';
    return 'border-green-500';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Activity className="h-4 w-4" />
          Analyser le système
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Analyse complète du système
          </DialogTitle>
          <DialogDescription>
            Diagnostic des modules, CRUD et fonctionnalités
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bouton d'analyse */}
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin mr-2">
                  <Activity className="h-4 w-4" />
                </div>
                Analyse en cours...
              </>
            ) : (
              'Lancer l\'analyse'
            )}
          </Button>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Analyse des modules et opérations CRUD...
              </p>
            </div>
          )}

          {/* Rapport d'analyse */}
          {report && !isAnalyzing && (
            <div className="space-y-4">
              {/* Vue d'ensemble */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Modules totaux</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{report.totalModules}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Modules sains</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">
                      {report.healthyModules}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Problèmes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      {report.criticalIssues}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommandations */}
              {report.recommendations.length > 0 && (
                <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Recommandations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {report.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600">•</span>
                          <span className="text-yellow-900 dark:text-yellow-100">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Liste des modules */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">État des modules</CardTitle>
                  <CardDescription>
                    Détails des opérations CRUD par module
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {report.modules.map((module, index) => (
                        <Card 
                          key={index} 
                          className={`border-l-4 ${getModuleStatusColor(module)}`}
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                              <span>{module.moduleName}</span>
                              {module.issues.length === 0 && module.missingFeatures.length === 0 ? (
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                  OK
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  {module.issues.length} problème(s)
                                </Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* Status CRUD */}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                {getCRUDIcon(module.crudStatus.create)}
                                <Plus className="h-3 w-3" />
                                <span className="text-muted-foreground">Create</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {getCRUDIcon(module.crudStatus.read)}
                                <Eye className="h-3 w-3" />
                                <span className="text-muted-foreground">Read</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {getCRUDIcon(module.crudStatus.update)}
                                <FileEdit className="h-3 w-3" />
                                <span className="text-muted-foreground">Update</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {getCRUDIcon(module.crudStatus.delete)}
                                <Trash2 className="h-3 w-3" />
                                <span className="text-muted-foreground">Delete</span>
                              </div>
                            </div>

                            {/* Problèmes */}
                            {module.issues.length > 0 && (
                              <div className="space-y-1">
                                {module.issues.map((issue, i) => (
                                  <div key={i} className="flex items-start gap-2 text-sm">
                                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-red-600 dark:text-red-400">{issue}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Fonctionnalités manquantes */}
                            {module.missingFeatures.length > 0 && (
                              <div className="space-y-1">
                                {module.missingFeatures.map((feature, i) => (
                                  <div key={i} className="flex items-start gap-2 text-sm">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-yellow-600 dark:text-yellow-400">{feature}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Avertissements */}
                            {module.warnings.length > 0 && (
                              <div className="space-y-1">
                                {module.warnings.map((warning, i) => (
                                  <div key={i} className="flex items-start gap-2 text-sm">
                                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-orange-600 dark:text-orange-400">{warning}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
