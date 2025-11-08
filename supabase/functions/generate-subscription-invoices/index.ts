import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Subscription {
  id: string;
  client_id: string;
  service_name: string;
  monthly_amount: number;
  billing_day: number;
  next_billing_date: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting subscription invoice generation...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    console.log(`Checking for subscriptions to bill on ${todayStr}`);

    // Fetch active subscriptions that need billing
    const { data: subscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .lte('next_billing_date', todayStr);

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions to process`);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No subscriptions to process',
          processed: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Process each subscription
    for (const subscription of subscriptions as Subscription[]) {
      try {
        console.log(`Processing subscription ${subscription.id} for client ${subscription.client_id}`);

        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            number: invoiceNumber,
            client_id: subscription.client_id,
            subscription_id: subscription.id,
            invoice_type: 'subscription',
            date: todayStr,
            subtotal: subscription.monthly_amount,
            tax: 0,
            discount: 0,
            total: subscription.monthly_amount,
            status: 'sent',
            payment_status: 'unpaid',
            paid_amount: 0,
            remaining_balance: subscription.monthly_amount,
            notes: `Facture mensuelle - Abonnement: ${subscription.service_name}`,
          })
          .select()
          .single();

        if (invoiceError) {
          console.error(`Error creating invoice for subscription ${subscription.id}:`, invoiceError);
          errorCount++;
          errors.push({ subscriptionId: subscription.id, error: invoiceError.message });
          continue;
        }

        console.log(`Created invoice ${invoiceNumber} (ID: ${invoice.id})`);

        // Create invoice item
        const { error: itemError } = await supabase
          .from('invoice_items')
          .insert({
            invoice_id: invoice.id,
            product_id: null, // No product linked for subscription services
            quantity: 1,
            amount: subscription.monthly_amount,
          });

        if (itemError) {
          console.error(`Error creating invoice item:`, itemError);
          // Continue even if item creation fails, invoice is created
        }

        // Calculate next billing date
        const currentBillingDate = new Date(subscription.next_billing_date);
        const nextMonth = new Date(currentBillingDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        // Adjust for billing day
        nextMonth.setDate(subscription.billing_day);
        const nextBillingDate = nextMonth.toISOString().split('T')[0];

        // Update subscription billing dates
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            last_billing_date: todayStr,
            next_billing_date: nextBillingDate,
          })
          .eq('id', subscription.id);

        if (updateError) {
          console.error(`Error updating subscription ${subscription.id}:`, updateError);
          errorCount++;
          errors.push({ subscriptionId: subscription.id, error: updateError.message });
          continue;
        }

        console.log(`Updated subscription ${subscription.id}, next billing: ${nextBillingDate}`);
        successCount++;

      } catch (error: any) {
        console.error(`Error processing subscription ${subscription.id}:`, error);
        errorCount++;
        errors.push({ subscriptionId: subscription.id, error: error.message });
      }
    }

    const result = {
      success: errorCount === 0,
      message: `Processed ${subscriptions.length} subscriptions`,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    };

    console.log('Subscription billing completed:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Fatal error in subscription billing:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});