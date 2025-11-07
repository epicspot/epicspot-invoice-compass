-- Fix security warnings by setting search_path for functions

-- Fix calculate_next_billing_date function
CREATE OR REPLACE FUNCTION public.calculate_next_billing_date(
  p_current_date TIMESTAMP WITH TIME ZONE,
  p_billing_day INTEGER
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_date TIMESTAMP WITH TIME ZONE;
  v_current_day INTEGER;
BEGIN
  v_current_day := EXTRACT(DAY FROM p_current_date);
  
  IF v_current_day < p_billing_day THEN
    v_next_date := date_trunc('month', p_current_date) + (p_billing_day - 1) * INTERVAL '1 day';
  ELSE
    v_next_date := date_trunc('month', p_current_date + INTERVAL '1 month') + (p_billing_day - 1) * INTERVAL '1 day';
  END IF;
  
  RETURN v_next_date;
END;
$$;

-- Fix set_next_billing_date function
CREATE OR REPLACE FUNCTION public.set_next_billing_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.next_billing_date IS NULL THEN
    NEW.next_billing_date := public.calculate_next_billing_date(
      COALESCE(NEW.start_date, now()),
      NEW.billing_day
    );
  END IF;
  RETURN NEW;
END;
$$;