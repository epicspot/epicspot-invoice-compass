-- Create document templates table
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'contract', 'amendment', 'reception', 'invoice', 'quote'
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  layout JSONB NOT NULL DEFAULT '{}'::jsonb,
  styles JSONB NOT NULL DEFAULT '{}'::jsonb,
  logo_url TEXT,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view templates"
  ON public.document_templates
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create templates"
  ON public.document_templates
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates"
  ON public.document_templates
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete templates"
  ON public.document_templates
  FOR DELETE
  USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.document_templates (name, type, sections, layout, styles, is_default) VALUES
(
  'Contrat Standard',
  'contract',
  '[
    {"id": "header", "name": "En-tête", "enabled": true, "order": 1},
    {"id": "market_info", "name": "Informations du marché", "enabled": true, "order": 2},
    {"id": "client_info", "name": "Informations client", "enabled": true, "order": 3},
    {"id": "amounts", "name": "Montants", "enabled": true, "order": 4},
    {"id": "terms", "name": "Conditions", "enabled": true, "order": 5},
    {"id": "description", "name": "Description", "enabled": true, "order": 6},
    {"id": "signatures", "name": "Signatures", "enabled": true, "order": 7}
  ]'::jsonb,
  '{
    "pageSize": "A4",
    "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20},
    "orientation": "portrait"
  }'::jsonb,
  '{
    "primaryColor": "#000000",
    "secondaryColor": "#666666",
    "titleFontSize": 18,
    "headingFontSize": 12,
    "bodyFontSize": 10,
    "fontFamily": "helvetica"
  }'::jsonb,
  true
),
(
  'Avenant Standard',
  'amendment',
  '[
    {"id": "header", "name": "En-tête", "enabled": true, "order": 1},
    {"id": "amendment_info", "name": "Informations avenant", "enabled": true, "order": 2},
    {"id": "reason", "name": "Motif", "enabled": true, "order": 3},
    {"id": "changes", "name": "Modifications", "enabled": true, "order": 4},
    {"id": "amounts", "name": "Montants", "enabled": true, "order": 5},
    {"id": "signatures", "name": "Signatures", "enabled": true, "order": 6}
  ]'::jsonb,
  '{
    "pageSize": "A4",
    "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20},
    "orientation": "portrait"
  }'::jsonb,
  '{
    "primaryColor": "#000000",
    "secondaryColor": "#666666",
    "titleFontSize": 18,
    "headingFontSize": 12,
    "bodyFontSize": 10,
    "fontFamily": "helvetica"
  }'::jsonb,
  true
),
(
  'PV Réception Standard',
  'reception',
  '[
    {"id": "header", "name": "En-tête", "enabled": true, "order": 1},
    {"id": "market_info", "name": "Marché concerné", "enabled": true, "order": 2},
    {"id": "attendees", "name": "Personnes présentes", "enabled": true, "order": 3},
    {"id": "milestones", "name": "Récapitulatif jalons", "enabled": true, "order": 4},
    {"id": "conformity", "name": "Conformité", "enabled": true, "order": 5},
    {"id": "observations", "name": "Observations", "enabled": true, "order": 6},
    {"id": "reserves", "name": "Réserves", "enabled": true, "order": 7},
    {"id": "signatures", "name": "Signatures", "enabled": true, "order": 8}
  ]'::jsonb,
  '{
    "pageSize": "A4",
    "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20},
    "orientation": "portrait"
  }'::jsonb,
  '{
    "primaryColor": "#000000",
    "secondaryColor": "#666666",
    "titleFontSize": 18,
    "headingFontSize": 12,
    "bodyFontSize": 10,
    "fontFamily": "helvetica"
  }'::jsonb,
  true
);