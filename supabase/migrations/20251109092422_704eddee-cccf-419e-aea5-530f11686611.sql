-- Add missing columns to system_backups if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'system_backups' AND column_name = 'size_bytes') THEN
    ALTER TABLE public.system_backups ADD COLUMN size_bytes BIGINT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'system_backups' AND column_name = 'tables_count') THEN
    ALTER TABLE public.system_backups ADD COLUMN tables_count INTEGER;
  END IF;
END $$;

-- Add delete policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_backups' 
    AND policyname = 'Admins can delete backups'
  ) THEN
    CREATE POLICY "Admins can delete backups"
      ON public.system_backups
      FOR DELETE
      USING (is_admin(auth.uid()));
  END IF;
END $$;

-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backups',
  'backups',
  false,
  52428800, -- 50MB limit
  ARRAY['application/json', 'application/gzip']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for backups bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Admins can upload backups'
  ) THEN
    CREATE POLICY "Admins can upload backups"
      ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'backups' AND
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Admins can view backups'
  ) THEN
    CREATE POLICY "Admins can view backups"
      ON storage.objects
      FOR SELECT
      USING (
        bucket_id = 'backups' AND
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Admins can delete backups'
  ) THEN
    CREATE POLICY "Admins can delete backups"
      ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'backups' AND
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;