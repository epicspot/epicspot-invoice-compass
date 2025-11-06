-- Table pour les notifications push
CREATE TABLE IF NOT EXISTS public.push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for push notifications
CREATE POLICY "Users can view their own notifications"
  ON public.push_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications"
  ON public.push_notifications
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can update their own notifications"
  ON public.push_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Table pour la présence en temps réel
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline',
  current_page TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Policies for user presence
CREATE POLICY "Everyone can view presence"
  ON public.user_presence
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own presence"
  ON public.user_presence
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presence status"
  ON public.user_presence
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- Add replica identity for full row tracking
ALTER TABLE public.push_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;