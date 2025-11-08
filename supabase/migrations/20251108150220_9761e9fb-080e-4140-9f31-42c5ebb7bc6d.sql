-- Create company_info table
CREATE TABLE IF NOT EXISTS public.company_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo text,
  address text NOT NULL,
  phone text,
  email text,
  website text,
  tax_id text,
  bank_account text,
  bank_name text,
  bank_iban text,
  bank_swift text,
  signatory text,
  signatory_title text,
  slogan text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view company info"
  ON public.company_info FOR SELECT
  USING (true);

CREATE POLICY "Admins can update company info"
  ON public.company_info FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert company info"
  ON public.company_info FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Insert default company info if none exists
INSERT INTO public.company_info (name, address, phone, email, tax_id)
VALUES ('EPICSPOT_CONSULTING', 'Abidjan, Côte d''Ivoire', '+225 XX XX XX XX', 'contact@epicspot.com', 'RC: XXXXXXX - IF: XXXXXXX')
ON CONFLICT DO NOTHING;