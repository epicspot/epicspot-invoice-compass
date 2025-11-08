import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCashForecast } from '@/hooks/useCashForecast';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Sparkles, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function CashForecastWidget() {
  const { forecast, loading, generateForecast } = useCashForecast();
  const [period, setPeriod] = useState('30');

  const handleGenerate = async () => {
    try {
      await generateForecast(parseInt(period));
      toast.success('Prévisions générées avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération des prévisions');
    }
  };

  const getTrendIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Prévisions de trésorerie IA</CardTitle>
              <CardDescription>Analyse prédictive basée sur l'historique</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="15">15 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="60">60 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Génération...' : 'Générer'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!forecast ? (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Cliquez sur "Générer" pour créer vos prévisions IA</p>
          </div>
        ) : (
          <>
            {/* Graphique des prévisions */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.forecast}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'amount') return [`${value.toLocaleString()} FCFA`, 'Montant'];
                      if (name === 'confidence') return [`${(value * 100).toFixed(0)}%`, 'Confiance'];
                      return value;
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorAmount)" 
                    name="Montant prévu"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="hsl(var(--accent))" 
                    strokeDasharray="5 5"
                    name="Niveau de confiance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Tendances */}
            {forecast.trends.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tendances identifiées
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {forecast.trends.map((trend, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg border bg-card">
                      {getTrendIcon(trend.impact)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{trend.trend}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Confiance: {(trend.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommandations */}
            {forecast.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">💡 Recommandations</h3>
                <div className="space-y-2">
                  {forecast.recommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risques */}
            {forecast.risks.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Risques identifiés
                </h3>
                <div className="space-y-3">
                  {forecast.risks.map((risk, i) => (
                    <div key={i} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium">{risk.risk}</p>
                        <Badge variant={getSeverityColor(risk.severity) as any}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
