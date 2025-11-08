-- Créer une table pour les templates d'emails
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('invoice_reminder', 'quote_reminder', 'payment_confirmation')),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  variables JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajouter RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Authenticated users can view email templates"
  ON public.email_templates
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert email templates"
  ON public.email_templates
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update email templates"
  ON public.email_templates
  FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete email templates"
  ON public.email_templates
  FOR DELETE
  USING (is_admin(auth.uid()));

-- Trigger pour updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer un template par défaut pour les rappels de factures
INSERT INTO public.email_templates (name, type, subject, body_html, is_default, variables) VALUES
(
  'Rappel de paiement - Template par défaut',
  'invoice_reminder',
  'Rappel de paiement - Facture {{invoice_number}}',
  '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif;
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
      <h1 style="margin: 0;">{{email_title}}</h1>
    </div>
    <div class="content">
      <p>Bonjour {{client_name}},</p>
      
      <p>{{email_message}}</p>
      
      <div class="invoice-details">
        <p><strong>Numéro de facture:</strong> <span class="highlight">{{invoice_number}}</span></p>
        <p><strong>Montant dû:</strong></p>
        <div class="amount">{{amount}} FCFA</div>
        <p><strong>Date d''échéance:</strong> {{due_date}}</p>
      </div>
      
      <p>Nous vous prions de bien vouloir procéder au règlement de cette facture dans les meilleurs délais.</p>
      
      <p>Si vous avez déjà effectué le paiement, veuillez ignorer ce message. Dans le cas contraire, n''hésitez pas à nous contacter pour toute question.</p>
      
      <p>{{signature}}</p>
    </div>
    <div class="footer">
      <p>{{footer_text}}</p>
    </div>
  </body>
</html>',
  true,
  '["client_name", "invoice_number", "amount", "due_date", "email_title", "email_message", "signature", "footer_text"]'::jsonb
);