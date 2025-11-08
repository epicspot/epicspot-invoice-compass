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

    // Récupérer le template par défaut depuis la base de données
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('type', 'invoice_reminder')
      .eq('is_default', true)
      .single();

    if (templateError || !template) {
      console.error('Template not found:', templateError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email template not configured',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Formater le montant et la date
    const formattedAmount = amount.toLocaleString('fr-FR');
    const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString('fr-FR') : '';

    // Variables pour le template
    const variables: Record<string, string> = {
      client_name: clientName,
      invoice_number: invoiceNumber,
      amount: formattedAmount,
      due_date: formattedDueDate,
      email_title: 'Rappel de paiement',
      email_message: 'Nous vous informons qu\'une facture reste impayée et nécessite votre attention.',
      signature: 'Cordialement,<br><strong>L\'équipe de gestion</strong>',
      footer_text: 'Ceci est un message automatique, merci de ne pas y répondre directement.',
    };

    // Remplacer les variables dans le sujet et le body
    let emailSubject = template.subject;
    let emailHtml = template.body_html;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      emailSubject = emailSubject.replace(regex, value);
      emailHtml = emailHtml.replace(regex, value);
    });

    // Envoyer l'email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Gestion <onboarding@resend.dev>',
      to: [clientEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log('Email sent successfully:', emailData?.id);

    // Enregistrer dans l'historique
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
