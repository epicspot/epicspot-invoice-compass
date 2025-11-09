import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { backup_type } = await req.json()

    // Get current user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!roles) {
      throw new Error('Insufficient permissions')
    }

    // Collect data from critical tables for backup
    const tables = [
      'clients',
      'products',
      'invoices',
      'invoice_items',
      'quotes',
      'quote_items',
      'suppliers',
      'purchase_orders',
      'purchase_order_items',
      'collections',
      'leads',
      'markets',
      'subscriptions',
      'cash_registers',
      'cash_transactions',
      'stock_movements',
      'user_roles',
      'audit_log',
      'document_signatures',
      'reminders'
    ]

    const backupData: any = {
      timestamp: new Date().toISOString(),
      created_by: user.id,
      tables: {}
    }

    // Fetch data from each table
    for (const table of tables) {
      const { data, error } = await supabaseClient
        .from(table)
        .select('*')
        .limit(1000)

      if (!error && data) {
        backupData.tables[table] = {
          count: data.length,
          data: data
        }
      }
    }

    // Calculate backup size
    const backupJson = JSON.stringify(backupData);
    const sizeBytes = new Blob([backupJson]).size;

    // Store backup in system_backups table
    const { data: backup, error: backupError } = await supabaseClient
      .from('system_backups')
      .insert({
        backup_type: backup_type || 'manual',
        backup_data: backupData,
        created_by: user.id,
        size_bytes: sizeBytes,
        tables_count: Object.keys(backupData.tables).length,
        description: `Backup ${backup_type === 'auto' ? 'automatique' : 'manuel'} - ${new Date().toLocaleDateString('fr-FR')}`
      })
      .select()
      .single()

    if (backupError) {
      throw backupError
    }

    // Log the backup action
    await supabaseClient.from('audit_log').insert({
      user_id: user.id,
      user_email: user.email,
      action: 'EXPORT',
      table_name: 'system_backups',
      record_id: backup.id,
      description: `Backup ${backup_type} créé avec succès`
    })

    console.log('Backup created successfully:', backup.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        backup_id: backup.id,
        tables_count: Object.keys(backupData.tables).length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Backup error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
