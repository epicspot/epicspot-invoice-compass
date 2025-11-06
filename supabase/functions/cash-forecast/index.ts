import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { period = 30 } = await req.json()

    // Get historical data for analysis
    // Note: Adjust table names based on your actual schema
    const promises = [
      supabaseClient.from('audit_log').select('*').limit(100),
      // Add other relevant tables as they become available
    ]

    const results = await Promise.all(promises)
    
    const historicalData = {
      auditLogs: results[0].data || [],
      recordCount: results[0].data?.length || 0
    }

    // Prepare the analysis prompt
    const systemPrompt = `Tu es un expert en analyse financière et prévisions de trésorerie. 
Analyse les données historiques fournies et génère des prévisions détaillées.`

    const userPrompt = `Basé sur ces données historiques:
- ${historicalData.recordCount} enregistrements d'activité
- Période demandée: ${period} jours

Génère une prévision de trésorerie incluant:
1. Tendances identifiées
2. Prévisions pour les ${period} prochains jours
3. Recommandations stratégiques
4. Indicateurs de risque

Format JSON structuré avec: trends, forecast (array de {date, amount, confidence}), recommendations, risks`

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    // Use tool calling for structured output
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_forecast',
            description: 'Generate cash flow forecast with trends and recommendations',
            parameters: {
              type: 'object',
              properties: {
                trends: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      trend: { type: 'string' },
                      impact: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
                      confidence: { type: 'number' }
                    },
                    required: ['trend', 'impact', 'confidence']
                  }
                },
                forecast: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string' },
                      amount: { type: 'number' },
                      confidence: { type: 'number' }
                    },
                    required: ['date', 'amount', 'confidence']
                  }
                },
                recommendations: {
                  type: 'array',
                  items: { type: 'string' }
                },
                risks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      risk: { type: 'string' },
                      severity: { type: 'string', enum: ['low', 'medium', 'high'] },
                      mitigation: { type: 'string' }
                    },
                    required: ['risk', 'severity', 'mitigation']
                  }
                }
              },
              required: ['trends', 'forecast', 'recommendations', 'risks']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_forecast' } }
      }),
    })

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de taux dépassée. Réessayez plus tard.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédit insuffisant. Ajoutez des crédits à votre espace de travail.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    console.log('AI Response:', JSON.stringify(aiData, null, 2))

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0]
    if (!toolCall) {
      throw new Error('No tool call in AI response')
    }

    const forecastData = JSON.parse(toolCall.function.arguments)

    return new Response(
      JSON.stringify({
        success: true,
        data: forecastData,
        metadata: {
          period,
          generated_at: new Date().toISOString(),
          data_points: historicalData.recordCount
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Forecast error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
