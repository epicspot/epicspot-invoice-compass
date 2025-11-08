-- Ajouter une colonne pour le type de notification (email ou sms)
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS notification_type TEXT DEFAULT 'sms' CHECK (notification_type IN ('email', 'sms'));

-- Ajouter une colonne pour stocker l'email du destinataire
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS recipient_email TEXT;

-- Ajouter une colonne pour le nombre de tentatives
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;

-- Ajouter une colonne pour la dernière date d'envoi
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMP WITH TIME ZONE;

-- Créer une table pour tracker l'historique des envois d'emails
CREATE TABLE IF NOT EXISTS public.email_reminders_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID REFERENCES public.reminders(id) ON DELETE CASCADE,
  invoice_id TEXT,
  client_email TEXT NOT NULL,
  client_name TEXT,
  invoice_number TEXT,
  amount DECIMAL(15,2),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT CHECK (status IN ('sent', 'failed', 'delivered')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajouter RLS sur la nouvelle table
ALTER TABLE public.email_reminders_history ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs authentifiés de voir l'historique
CREATE POLICY "Users can view email history"
  ON public.email_reminders_history
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Politique pour permettre l'insertion via service role
CREATE POLICY "Service role can insert email history"
  ON public.email_reminders_history
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);