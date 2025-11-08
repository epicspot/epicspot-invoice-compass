-- Add sync flag to sites table
ALTER TABLE public.sites
ADD COLUMN IF NOT EXISTS use_headquarters_info boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS tax_id text,
ADD COLUMN IF NOT EXISTS bank_account text,
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS bank_iban text,
ADD COLUMN IF NOT EXISTS bank_swift text;

-- Function to get site info with headquarters fallback
CREATE OR REPLACE FUNCTION public.get_site_complete_info(p_site_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site record;
  v_company record;
  v_result jsonb;
BEGIN
  -- Get site info
  SELECT * INTO v_site
  FROM public.sites
  WHERE id = p_site_id;
  
  -- If site doesn't exist, return null
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- If site uses headquarters info, merge with company info
  IF v_site.use_headquarters_info THEN
    SELECT * INTO v_company
    FROM public.company_info
    LIMIT 1;
    
    v_result := jsonb_build_object(
      'id', v_site.id,
      'name', COALESCE(v_site.name, v_company.name),
      'address', COALESCE(v_site.address, v_company.address),
      'phone', COALESCE(v_site.phone, v_company.phone),
      'email', COALESCE(v_site.email, v_company.email),
      'tax_id', COALESCE(v_site.tax_id, v_company.tax_id),
      'bank_account', COALESCE(v_site.bank_account, v_company.bank_account),
      'bank_name', COALESCE(v_site.bank_name, v_company.bank_name),
      'bank_iban', COALESCE(v_site.bank_iban, v_company.bank_iban),
      'bank_swift', COALESCE(v_site.bank_swift, v_company.bank_swift),
      'use_headquarters_info', v_site.use_headquarters_info
    );
  ELSE
    -- Site has its own info
    v_result := jsonb_build_object(
      'id', v_site.id,
      'name', v_site.name,
      'address', v_site.address,
      'phone', v_site.phone,
      'email', v_site.email,
      'tax_id', v_site.tax_id,
      'bank_account', v_site.bank_account,
      'bank_name', v_site.bank_name,
      'bank_iban', v_site.bank_iban,
      'bank_swift', v_site.bank_swift,
      'use_headquarters_info', v_site.use_headquarters_info
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Function to sync sites when company info updates
CREATE OR REPLACE FUNCTION public.sync_sites_with_headquarters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update all sites that use headquarters info
  -- This is just for notification purposes, actual data is merged on read
  UPDATE public.sites
  SET updated_at = now()
  WHERE use_headquarters_info = true;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync sites when company info changes
DROP TRIGGER IF EXISTS trigger_sync_sites_on_company_update ON public.company_info;
CREATE TRIGGER trigger_sync_sites_on_company_update
  AFTER UPDATE ON public.company_info
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_sites_with_headquarters();