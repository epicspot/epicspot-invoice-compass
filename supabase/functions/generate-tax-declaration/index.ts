import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { periodStart, periodEnd } = await req.json();

    console.log('Generating tax declaration for period:', periodStart, 'to', periodEnd);

    // Fetch all invoices for the period
    const { data: invoices, error: invoicesError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        invoice_items (
          quantity,
          amount,
          product_id,
          products (
            category_id,
            product_categories (
              tax_rate
            )
          )
        )
      `)
      .gte('date', periodStart)
      .lte('date', periodEnd)
      .eq('status', 'validated');

    if (invoicesError) throw invoicesError;

    // Fetch all purchase orders for the period
    const { data: purchaseOrders, error: poError } = await supabaseClient
      .from('purchase_orders')
      .select(`
        *,
        purchase_order_items (
          quantity,
          amount,
          product_id,
          products (
            category_id,
            product_categories (
              tax_rate
            )
          )
        )
      `)
      .gte('date', periodStart)
      .lte('date', periodEnd)
      .eq('status', 'validated');

    if (poError) throw poError;

    // Calculate VAT collected from sales
    let totalSales = 0;
    let vatCollected = 0;
    const salesByRate: Record<number, { amount: number; vat: number }> = {};

    (invoices || []).forEach((invoice: any) => {
      const total = Number(invoice.total);
      totalSales += total;

      (invoice.invoice_items || []).forEach((item: any) => {
        const itemAmount = Number(item.amount);
        const taxRate = item.products?.product_categories?.tax_rate || 18;
        
        const itemVat = (itemAmount * taxRate) / (100 + taxRate);
        vatCollected += itemVat;

        if (!salesByRate[taxRate]) {
          salesByRate[taxRate] = { amount: 0, vat: 0 };
        }
        salesByRate[taxRate].amount += itemAmount;
        salesByRate[taxRate].vat += itemVat;
      });
    });

    // Calculate VAT paid on purchases
    let totalPurchases = 0;
    let vatPaid = 0;
    const purchasesByRate: Record<number, { amount: number; vat: number }> = {};

    (purchaseOrders || []).forEach((po: any) => {
      const total = Number(po.total);
      totalPurchases += total;

      (po.purchase_order_items || []).forEach((item: any) => {
        const itemAmount = Number(item.amount);
        const taxRate = item.products?.product_categories?.tax_rate || 18;
        
        const itemVat = (itemAmount * taxRate) / (100 + taxRate);
        vatPaid += itemVat;

        if (!purchasesByRate[taxRate]) {
          purchasesByRate[taxRate] = { amount: 0, vat: 0 };
        }
        purchasesByRate[taxRate].amount += itemAmount;
        purchasesByRate[taxRate].vat += itemVat;
      });
    });

    // Calculate net VAT due
    const vatDue = vatCollected - vatPaid;

    // Create the tax declaration
    const { data: declaration, error: declarationError } = await supabaseClient
      .from('tax_declarations')
      .insert({
        period_start: periodStart,
        period_end: periodEnd,
        total_sales: totalSales,
        total_purchases: totalPurchases,
        vat_collected: vatCollected,
        vat_paid: vatPaid,
        vat_due: vatDue,
        status: 'draft',
        details: {
          sales_by_rate: salesByRate,
          purchases_by_rate: purchasesByRate,
          invoices_count: invoices?.length || 0,
          purchase_orders_count: purchaseOrders?.length || 0
        }
      })
      .select()
      .single();

    if (declarationError) throw declarationError;

    console.log('Tax declaration created successfully:', declaration.id);

    return new Response(
      JSON.stringify({
        success: true,
        declaration,
        summary: {
          total_sales: totalSales,
          total_purchases: totalPurchases,
          vat_collected: vatCollected,
          vat_paid: vatPaid,
          vat_due: vatDue
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating tax declaration:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});