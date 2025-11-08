-- Create markets/contracts table
CREATE TABLE public.markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL,
  title text NOT NULL,
  description text,
  client_id uuid REFERENCES public.clients(id),
  type text NOT NULL DEFAULT 'public',
  status text NOT NULL DEFAULT 'draft',
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  estimated_amount numeric NOT NULL DEFAULT 0,
  actual_amount numeric NOT NULL DEFAULT 0,
  deposit_percentage numeric DEFAULT 0,
  deposit_amount numeric DEFAULT 0,
  payment_terms text,
  delivery_terms text,
  specifications jsonb,
  documents jsonb DEFAULT '[]'::jsonb,
  site_id uuid REFERENCES public.sites(id),
  responsible_user_id uuid,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create market milestones table
CREATE TABLE public.market_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES public.markets(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  completion_date timestamp with time zone,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  percentage numeric DEFAULT 0,
  invoice_id uuid REFERENCES public.invoices(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create market documents/attachments table
CREATE TABLE public.market_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES public.markets(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  title text NOT NULL,
  file_url text,
  file_name text,
  file_size integer,
  uploaded_by uuid,
  uploaded_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for markets
CREATE POLICY "Authenticated users can view markets"
ON public.markets FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert markets"
ON public.markets FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update markets"
ON public.markets FOR UPDATE
USING (true);

CREATE POLICY "Admins can delete markets"
ON public.markets FOR DELETE
USING (is_admin(auth.uid()));

-- RLS Policies for market_milestones
CREATE POLICY "Authenticated users can view milestones"
ON public.market_milestones FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert milestones"
ON public.market_milestones FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update milestones"
ON public.market_milestones FOR UPDATE
USING (true);

CREATE POLICY "Admins can delete milestones"
ON public.market_milestones FOR DELETE
USING (is_admin(auth.uid()));

-- RLS Policies for market_documents
CREATE POLICY "Authenticated users can view documents"
ON public.market_documents FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert documents"
ON public.market_documents FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can delete documents"
ON public.market_documents FOR DELETE
USING (is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_markets_updated_at
BEFORE UPDATE ON public.markets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_milestones_updated_at
BEFORE UPDATE ON public.market_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();