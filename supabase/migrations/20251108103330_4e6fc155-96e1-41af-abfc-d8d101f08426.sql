-- Create template versions table
CREATE TABLE public.template_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.document_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  sections JSONB NOT NULL,
  layout JSONB NOT NULL,
  styles JSONB NOT NULL,
  logo_url TEXT,
  change_summary TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_template_versions_template_id ON public.template_versions(template_id);
CREATE INDEX idx_template_versions_created_at ON public.template_versions(created_at DESC);

-- Enable RLS
ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view template versions"
  ON public.template_versions
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create versions"
  ON public.template_versions
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Create function to automatically create version on template update
CREATE OR REPLACE FUNCTION public.create_template_version()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_version_number INTEGER;
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM public.template_versions
  WHERE template_id = NEW.id;

  -- Create version snapshot (only if template already exists - not on insert)
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.template_versions (
      template_id,
      version_number,
      name,
      sections,
      layout,
      styles,
      logo_url,
      change_summary,
      created_by
    ) VALUES (
      OLD.id,
      v_version_number,
      OLD.name,
      OLD.sections,
      OLD.layout,
      OLD.styles,
      OLD.logo_url,
      'Version automatique avant modification',
      auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for automatic versioning
CREATE TRIGGER create_template_version_trigger
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.create_template_version();

-- Enable realtime for template versions
ALTER PUBLICATION supabase_realtime ADD TABLE public.template_versions;