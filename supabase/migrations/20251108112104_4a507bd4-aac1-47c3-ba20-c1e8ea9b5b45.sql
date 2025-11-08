-- Add tags column to template_versions table
ALTER TABLE public.template_versions
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Add comment to explain the tags column
COMMENT ON COLUMN public.template_versions.tags IS 'Tags pour marquer les versions (stable, test, production, etc.)';