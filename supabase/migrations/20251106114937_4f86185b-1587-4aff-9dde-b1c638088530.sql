-- Add missing columns to vendors table
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS code text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES public.sites(id),
ADD COLUMN IF NOT EXISTS total_debt numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_balance numeric DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_site_id ON public.vendors(site_id);
CREATE INDEX IF NOT EXISTS idx_vendors_code ON public.vendors(code);