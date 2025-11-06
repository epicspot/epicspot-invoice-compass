-- Add vendor_id to invoices table to support vendor invoices
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.vendors(id);

-- Make client_id nullable since now we can have either client or vendor
ALTER TABLE public.invoices
ALTER COLUMN client_id DROP NOT NULL;

-- Add check constraint to ensure either client_id or vendor_id is set
ALTER TABLE public.invoices
ADD CONSTRAINT invoices_client_or_vendor_check 
CHECK (
  (client_id IS NOT NULL AND vendor_id IS NULL) OR
  (client_id IS NULL AND vendor_id IS NOT NULL)
);

-- Create index for vendor invoices
CREATE INDEX IF NOT EXISTS idx_invoices_vendor_id ON public.invoices(vendor_id);

-- Update collections to work with vendor invoices too
-- Collections can now link to invoices that belong to vendors
COMMENT ON COLUMN public.invoices.vendor_id IS 'Reference to vendor if this is a vendor invoice (for credit sales to vendors)';
COMMENT ON COLUMN public.invoices.client_id IS 'Reference to client if this is a client invoice (regular sales)';
COMMENT ON CONSTRAINT invoices_client_or_vendor_check ON public.invoices IS 'Ensures invoice has either a client or a vendor, but not both';