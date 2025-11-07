-- Create subscriptions table for internet services
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  monthly_amount NUMERIC NOT NULL,
  billing_day INTEGER NOT NULL DEFAULT 1,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  last_billing_date TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_billing_day CHECK (billing_day >= 1 AND billing_day <= 28),
  CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'cancelled'))
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert subscriptions"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update subscriptions"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete subscriptions"
  ON public.subscriptions FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate next billing date
CREATE OR REPLACE FUNCTION public.calculate_next_billing_date(
  p_current_date TIMESTAMP WITH TIME ZONE,
  p_billing_day INTEGER
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_date TIMESTAMP WITH TIME ZONE;
  v_current_day INTEGER;
BEGIN
  v_current_day := EXTRACT(DAY FROM p_current_date);
  
  -- If we haven't reached the billing day this month, use this month
  IF v_current_day < p_billing_day THEN
    v_next_date := date_trunc('month', p_current_date) + (p_billing_day - 1) * INTERVAL '1 day';
  ELSE
    -- Otherwise, use next month
    v_next_date := date_trunc('month', p_current_date + INTERVAL '1 month') + (p_billing_day - 1) * INTERVAL '1 day';
  END IF;
  
  RETURN v_next_date;
END;
$$;

-- Create trigger to set next_billing_date on insert
CREATE OR REPLACE FUNCTION public.set_next_billing_date()
RETURNS TRIGGER
LANGUAGE plpgsql
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

CREATE TRIGGER set_subscription_next_billing_date
  BEFORE INSERT ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_next_billing_date();

-- Create index for performance
CREATE INDEX idx_subscriptions_client_id ON public.subscriptions(client_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing_date ON public.subscriptions(next_billing_date);