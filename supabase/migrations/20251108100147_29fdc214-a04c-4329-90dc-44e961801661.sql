-- Add tax_rate to product_categories
ALTER TABLE public.product_categories
ADD COLUMN tax_rate numeric DEFAULT 18 NOT NULL;

-- Create tax_declarations table
CREATE TABLE public.tax_declarations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  total_sales numeric NOT NULL DEFAULT 0,
  total_purchases numeric NOT NULL DEFAULT 0,
  vat_collected numeric NOT NULL DEFAULT 0,
  vat_paid numeric NOT NULL DEFAULT 0,
  vat_due numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  details jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  submitted_at timestamp with time zone
);

-- Enable RLS on tax_declarations
ALTER TABLE public.tax_declarations ENABLE ROW LEVEL SECURITY;

-- RLS policies for tax_declarations
CREATE POLICY "Admins can view all tax declarations"
ON public.tax_declarations
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert tax declarations"
ON public.tax_declarations
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update tax declarations"
ON public.tax_declarations
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete tax declarations"
ON public.tax_declarations
FOR DELETE
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_tax_declarations_updated_at
BEFORE UPDATE ON public.tax_declarations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update product_categories RLS to allow updates
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.product_categories;
CREATE POLICY "Admins can update categories"
ON public.product_categories
FOR UPDATE
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.product_categories;
CREATE POLICY "Admins can delete categories"
ON public.tax_declarations
FOR DELETE
USING (is_admin(auth.uid()));