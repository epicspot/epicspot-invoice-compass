-- Modify invoices table to add payment tracking
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_balance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid'));

-- Update existing invoices to set remaining_balance equal to total
UPDATE public.invoices 
SET remaining_balance = total, payment_status = 'unpaid'
WHERE remaining_balance IS NULL OR remaining_balance = 0;

-- Modify collections table to link to invoices instead of vendors
ALTER TABLE public.collections
DROP COLUMN IF EXISTS vendor_id,
ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_collections_invoice_id ON public.collections(invoice_id);
CREATE INDEX IF NOT EXISTS idx_collections_client_id ON public.collections(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON public.invoices(payment_status);

-- Create function to update invoice payment status
CREATE OR REPLACE FUNCTION public.update_invoice_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update invoice paid_amount and remaining_balance
  UPDATE public.invoices
  SET 
    paid_amount = COALESCE((
      SELECT SUM(amount) 
      FROM public.collections 
      WHERE invoice_id = NEW.invoice_id
    ), 0),
    remaining_balance = total - COALESCE((
      SELECT SUM(amount) 
      FROM public.collections 
      WHERE invoice_id = NEW.invoice_id
    ), 0)
  WHERE id = NEW.invoice_id;
  
  -- Update payment status
  UPDATE public.invoices
  SET payment_status = CASE
    WHEN remaining_balance <= 0 THEN 'paid'
    WHEN paid_amount > 0 THEN 'partial'
    ELSE 'unpaid'
  END
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update invoice payment status
DROP TRIGGER IF EXISTS update_invoice_payment_on_collection ON public.collections;
CREATE TRIGGER update_invoice_payment_on_collection
AFTER INSERT OR UPDATE OR DELETE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION public.update_invoice_payment_status();