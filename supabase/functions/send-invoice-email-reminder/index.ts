import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailReminderRequest {
  invoiceId: string;
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate?: string;
  reminderId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, clientEmail, clientName, invoiceNumber, amount, dueDate, reminderId }: EmailReminderRequest = await req.json();

    console.log('Sending invoice email reminder:', { invoiceId, clientEmail, invoiceNumber });

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured - email will not be sent');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email service not configured. Please add RESEND_API_KEY.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const resend = new Resend(resendApiKey);

    // Formater le montant
    const formattedAmount = amount.toLocaleString('fr-FR');
    const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString('fr-FR') : '';

    // Créer le contenu de l'email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .invoice-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .amount {
              font-size: 28px;
              font-weight: bold;
              color: #667eea;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .highlight {
              background-color: #fef3c7;
              padding: 2px 6px;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">Rappel de paiement</h1>
          </div>
          <div class="content">
            <p>Bonjour ${clientName},</p>
            
            <p>Nous vous informons qu'une facture reste impayée et nécessite votre attention.</p>
            
            <div class="invoice-details">
              <p><strong>Numéro de facture:</strong> <span class="highlight">${invoiceNumber}</span></p>
              <p><strong>Montant dû:</strong></p>
              <div class="amount">${formattedAmount} FCFA</div>
              ${dueDate ? `<p><strong>Date d'échéance:</strong> ${formattedDueDate}</p>` : ''}
            </div>
            
            <p>Nous vous prions de bien vouloir procéder au règlement de cette facture dans les meilleurs délais.</p>
            
            <p>Si vous avez déjà effectué le paiement, veuillez ignorer ce message. Dans le cas contraire, n'hésitez pas à nous contacter pour toute question.</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe de gestion</strong></p>
          </div>
          <div class="footer">
            <p>Ceci est un message automatique, merci de ne pas y répondre directement.</p>
          </div>
        </body>
      </html>
    `;

    // Envoyer l'email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Gestion <onboarding@resend.dev>',
      to: [clientEmail],
      subject: `Rappel de paiement - Facture ${invoiceNumber}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log('Email sent successfully:', emailData?.id);

    // Enregistrer dans l'historique
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('email_reminders_history').insert({
      reminder_id: reminderId || null,
      invoice_id: invoiceId,
      client_email: clientEmail,
      client_name: clientName,
      invoice_number: invoiceNumber,
      amount: amount,
      status: 'sent',
    });

    // Mettre à jour le reminder si fourni
    if (reminderId) {
      await supabase
        .from('reminders')
        .update({
          last_sent_at: new Date().toISOString(),
          attempts: supabase.rpc('increment', { x: 1 }),
          status: 'sent',
        })
        .eq('id', reminderId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailData?.id,
        message: 'Email reminder sent successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-invoice-email-reminder:', error);
    
    // Enregistrer l'erreur dans l'historique si possible
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const requestBody = await req.json();
        
        await supabase.from('email_reminders_history').insert({
          reminder_id: requestBody.reminderId || null,
          invoice_id: requestBody.invoiceId,
          client_email: requestBody.clientEmail,
          client_name: requestBody.clientName,
          invoice_number: requestBody.invoiceNumber,
          amount: requestBody.amount,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } catch (historyError) {
      console.error('Failed to log error to history:', historyError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
