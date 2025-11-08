-- Ajouter une colonne pour lier les factures aux abonnements
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON public.invoices(subscription_id);

-- Ajouter une colonne pour marquer le type de facture
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS invoice_type TEXT DEFAULT 'standard' CHECK (invoice_type IN ('standard', 'subscription', 'quote'));

-- Mettre à jour les factures existantes qui sont des abonnements
UPDATE public.invoices
SET invoice_type = 'subscription'
WHERE notes LIKE '%Abonnement%';