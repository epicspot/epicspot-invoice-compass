import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ForecastTrend {
  trend: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface ForecastPoint {
  date: string;
  amount: number;
  confidence: number;
}

export interface ForecastRisk {
  risk: string;
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface CashForecast {
  trends: ForecastTrend[];
  forecast: ForecastPoint[];
  recommendations: string[];
  risks: ForecastRisk[];
}

export function useCashForecast() {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<CashForecast | null>(null);

  const generateForecast = async (period: number = 30) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cash-forecast', {
        body: { period }
      });

      if (error) throw error;

      if (data?.data) {
        setForecast(data.data);
      }

      return data;
    } catch (error) {
      console.error('Forecast generation error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    forecast,
    loading,
    generateForecast
  };
}
