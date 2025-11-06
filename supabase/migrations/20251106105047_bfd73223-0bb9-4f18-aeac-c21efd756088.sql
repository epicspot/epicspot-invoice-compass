-- Créer le type enum pour les rôles utilisateurs
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user', 'viewer');

-- Créer le type enum pour les actions d'audit
CREATE TYPE public.audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'PRINT', 'SIGN');

-- Table des rôles utilisateurs
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  UNIQUE (user_id, role)
);

-- Enable RLS sur user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction sécurisée pour vérifier les rôles (évite la récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Politiques RLS pour user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Table d'audit trail
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  action public.audit_action NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  description TEXT
);

-- Index pour améliorer les performances des requêtes d'audit
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);

-- Enable RLS sur audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour audit_log
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_log FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Table pour les signatures électroniques
CREATE TABLE public.document_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL,
  document_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  signature_data TEXT NOT NULL,
  ip_address TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB
);

-- Index pour les signatures
CREATE INDEX idx_signatures_document ON public.document_signatures(document_type, document_id);
CREATE INDEX idx_signatures_user ON public.document_signatures(user_id);
CREATE INDEX idx_signatures_date ON public.document_signatures(signed_at DESC);

-- Enable RLS sur document_signatures
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour signatures
CREATE POLICY "Users can view signatures they created"
  ON public.document_signatures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all signatures"
  ON public.document_signatures FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can create signatures"
  ON public.document_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Table pour les backups de configuration
CREATE TABLE public.system_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL,
  backup_data JSONB NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  description TEXT
);

-- Index pour les backups
CREATE INDEX idx_backups_type ON public.system_backups(backup_type);
CREATE INDEX idx_backups_date ON public.system_backups(created_at DESC);

-- Enable RLS sur system_backups
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour backups
CREATE POLICY "Admins can view all backups"
  ON public.system_backups FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create backups"
  ON public.system_backups FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Fonction pour logger automatiquement les actions
CREATE OR REPLACE FUNCTION public.log_audit_action(
  p_action public.audit_action,
  p_table_name TEXT,
  p_record_id TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_audit_id UUID;
  v_user_email TEXT;
BEGIN
  -- Récupérer l'email de l'utilisateur
  SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
  
  INSERT INTO public.audit_log (
    user_id,
    user_email,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    description
  ) VALUES (
    auth.uid(),
    v_user_email,
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    p_description
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;