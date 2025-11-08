import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RetryStats } from '@/hooks/useRetryMonitoring';
import { format, subHours, subDays, startOfHour, startOfDay, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RetryChartsProps {
  stats: RetryStats;
}

type TimePeriod = '24h' | '7d' | '30d';

const COLORS = {
  success: 'hsl(var(--success))',
  error: 'hsl(var(--destructive))',
  warning: 'hsl(var(--warning))',
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  muted: 'hsl(var(--muted))',
};

const PIE_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
];

export const RetryCharts = ({ stats }: RetryChartsProps) => {
  const getTimeSeriesData = (period: TimePeriod) => {
    const now = Date.now();
    let startTime: number;
    let bucketSize: number;
    let bucketFormatter: (date: Date) => string;

    switch (period) {
      case '24h':
        startTime = subHours(now, 24).getTime();
        bucketSize = 60 * 60 * 1000; // 1 hour
        bucketFormatter = (date) => format(date, 'HH:mm', { locale: fr });
        break;
      case '7d':
        startTime = subDays(now, 7).getTime();
        bucketSize = 24 * 60 * 60 * 1000; // 1 day
        bucketFormatter = (date) => format(date, 'EEE dd', { locale: fr });
        break;
      case '30d':
        startTime = subDays(now, 30).getTime();
        bucketSize = 24 * 60 * 60 * 1000; // 1 day
        bucketFormatter = (date) => format(date, 'dd/MM', { locale: fr });
        break;
    }

    // Filter retries within period
    const periodRetries = stats.recentRetries.filter(
      (retry) => retry.timestamp >= startTime
    );

    // Create time buckets
    const buckets = new Map<number, { success: number; failure: number; totalDuration: number; count: number }>();
    
    // Initialize buckets
    const numBuckets = Math.ceil((now - startTime) / bucketSize);
    for (let i = 0; i < numBuckets; i++) {
      const bucketTime = startTime + i * bucketSize;
      buckets.set(bucketTime, { success: 0, failure: 0, totalDuration: 0, count: 0 });
    }

    // Fill buckets with data
    periodRetries.forEach((retry) => {
      const bucketTime = Math.floor((retry.timestamp - startTime) / bucketSize) * bucketSize + startTime;
      const bucket = buckets.get(bucketTime);
      if (bucket) {
        if (retry.success) {
          bucket.success += 1;
        } else {
          bucket.failure += 1;
        }
        bucket.totalDuration += retry.duration;
        bucket.count += 1;
      }
    });

    // Convert to array for Recharts
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a - b)
      .map(([time, data]) => ({
        time: bucketFormatter(new Date(time)),
        succès: data.success,
        échecs: data.failure,
        total: data.success + data.failure,
        tempsMoyen: data.count > 0 ? Math.round(data.totalDuration / data.count) : 0,
      }));
  };

  const errorDistribution = useMemo(() => {
    return Object.entries(stats.errorsByCode)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [stats.errorsByCode]);

  const operationPerformance = useMemo(() => {
    return Object.entries(stats.errorsByOperation)
      .map(([name, data]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        succès: data.successes,
        échecs: data.failures,
        tauxSuccès: data.successes + data.failures > 0 
          ? ((data.successes / (data.successes + data.failures)) * 100).toFixed(1)
          : 0,
      }))
      .sort((a, b) => (b.succès + b.échecs) - (a.succès + a.échecs))
      .slice(0, 10);
  }, [stats.errorsByOperation]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
              {entry.name === 'tempsMoyen' && 'ms'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderPieLabel = ({ name, value, percent }: any) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <Tabs defaultValue="24h" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="24h">24 heures</TabsTrigger>
          <TabsTrigger value="7d">7 jours</TabsTrigger>
          <TabsTrigger value="30d">30 jours</TabsTrigger>
        </TabsList>
        <Badge variant="outline" className="gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Temps réel
        </Badge>
      </div>

      {(['24h', '7d', '30d'] as TimePeriod[]).map((period) => {
        const timeSeriesData = getTimeSeriesData(period);
        const hasData = timeSeriesData.some(d => d.total > 0);

        return (
          <TabsContent key={period} value={period} className="space-y-6">
            {/* Success/Failure Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Tendances Succès / Échecs</CardTitle>
                <CardDescription>
                  Évolution des tentatives de retry sur la période
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData}>
                      <defs>
                        <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.error} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.error} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="time" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="succès"
                        stroke={COLORS.success}
                        fillOpacity={1}
                        fill="url(#colorSuccess)"
                      />
                      <Area
                        type="monotone"
                        dataKey="échecs"
                        stroke={COLORS.error}
                        fillOpacity={1}
                        fill="url(#colorError)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Aucune donnée pour cette période
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Average Duration */}
              <Card>
                <CardHeader>
                  <CardTitle>Temps Moyen de Retry</CardTitle>
                  <CardDescription>
                    Durée moyenne des opérations avec retry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasData ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="time" 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="tempsMoyen"
                          stroke={COLORS.primary}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      Aucune donnée pour cette période
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Total Attempts */}
              <Card>
                <CardHeader>
                  <CardTitle>Volume de Tentatives</CardTitle>
                  <CardDescription>
                    Nombre total de tentatives par période
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasData ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="time" 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="total" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      Aucune donnée pour cette période
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        );
      })}

      {/* Error Distribution & Operation Performance - Same for all periods */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribution des Erreurs</CardTitle>
            <CardDescription>
              Répartition par type d'erreur
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={errorDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderPieLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {errorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune erreur enregistrée
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance par Opération</CardTitle>
            <CardDescription>
              Top 10 des opérations avec retry
            </CardDescription>
          </CardHeader>
          <CardContent>
            {operationPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={operationPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="succès" stackId="a" fill={COLORS.success} />
                  <Bar dataKey="échecs" stackId="a" fill={COLORS.error} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée d'opération
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Tabs>
  );
};
