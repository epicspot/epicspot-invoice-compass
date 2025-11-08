import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useReportGenerator, type ReportPeriod } from '@/hooks/useReportGenerator';
import { FileDown, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function ReportGenerator() {
  const { generateReport } = useReportGenerator();
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [includeLogs, setIncludeLogs] = useState(true);
  const [includeRetries, setIncludeRetries] = useState(true);
  const [includePerformance, setIncludePerformance] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateReport({
        period,
        customStartDate,
        customEndDate,
        includeLogs,
        includeRetries,
        includePerformance,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isValidConfig = () => {
    if (period === 'custom' && (!customStartDate || !customEndDate)) {
      return false;
    }
    return includeLogs || includeRetries || includePerformance;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Générateur de Rapports</CardTitle>
          <CardDescription>
            Créez des rapports détaillés de supervision exportables en PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Period Selection */}
          <div className="space-y-2">
            <Label>Période du rapport</Label>
            <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Hebdomadaire (7 derniers jours)</SelectItem>
                <SelectItem value="month">Mensuel (30 derniers jours)</SelectItem>
                <SelectItem value="custom">Période personnalisée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {period === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, 'PPP', { locale: fr }) : 'Sélectionner'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, 'PPP', { locale: fr }) : 'Sélectionner'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Content Selection */}
          <div className="space-y-3">
            <Label>Contenu du rapport</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="logs"
                checked={includeLogs}
                onCheckedChange={(checked) => setIncludeLogs(checked as boolean)}
              />
              <label
                htmlFor="logs"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Logs et erreurs
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="retries"
                checked={includeRetries}
                onCheckedChange={(checked) => setIncludeRetries(checked as boolean)}
              />
              <label
                htmlFor="retries"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Statistiques de retry
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="performance"
                checked={includePerformance}
                onCheckedChange={(checked) => setIncludePerformance(checked as boolean)}
              />
              <label
                htmlFor="performance"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Métriques de performance
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!isValidConfig() || isGenerating}
            className="w-full"
            size="lg"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {isGenerating ? 'Génération en cours...' : 'Générer le rapport PDF'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
          setPeriod('week');
          setIncludeLogs(true);
          setIncludeRetries(true);
          setIncludePerformance(true);
          handleGenerate();
        }}>
          <CardContent className="pt-6 text-center">
            <FileDown className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Rapport Hebdo Complet</h3>
            <p className="text-xs text-muted-foreground">Toutes les métriques - 7 jours</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
          setPeriod('month');
          setIncludeLogs(true);
          setIncludeRetries(true);
          setIncludePerformance(true);
          handleGenerate();
        }}>
          <CardContent className="pt-6 text-center">
            <FileDown className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Rapport Mensuel Complet</h3>
            <p className="text-xs text-muted-foreground">Toutes les métriques - 30 jours</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
          setPeriod('week');
          setIncludeLogs(true);
          setIncludeRetries(false);
          setIncludePerformance(false);
          handleGenerate();
        }}>
          <CardContent className="pt-6 text-center">
            <FileDown className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <h3 className="font-semibold mb-1">Rapport Erreurs</h3>
            <p className="text-xs text-muted-foreground">Logs uniquement - 7 jours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
