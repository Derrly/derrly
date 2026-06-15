
-- Multi-axis quality scoring
ALTER TABLE public.quality_reviews
  ADD COLUMN IF NOT EXISTS axes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS revision_cycle integer NOT NULL DEFAULT 0;

-- Project health extras
ALTER TABLE public.project_intelligence
  ADD COLUMN IF NOT EXISTS completion_percent integer,
  ADD COLUMN IF NOT EXISTS tech_debt_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS test_coverage_percent integer,
  ADD COLUMN IF NOT EXISTS quality_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Agent messages for War Room
CREATE TABLE IF NOT EXISTS public.agent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  run_id uuid,
  from_agent text NOT NULL,
  to_agent text,
  kind text NOT NULL CHECK (kind IN ('critique','approval','revision','decision','status','question','answer')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_messages TO authenticated;
GRANT ALL ON public.agent_messages TO service_role;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their agent messages"
  ON public.agent_messages FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
CREATE INDEX IF NOT EXISTS agent_messages_project_idx ON public.agent_messages(project_id, created_at DESC);

-- User preferences (cross-project memory)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid PRIMARY KEY,
  favorite_genres text[] NOT NULL DEFAULT '{}',
  design_patterns jsonb NOT NULL DEFAULT '[]'::jsonb,
  tone text,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Studio tasks
CREATE TABLE IF NOT EXISTS public.studio_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  run_id uuid,
  owner_id uuid NOT NULL,
  assignee_agent text NOT NULL,
  title text NOT NULL,
  deliverable text,
  acceptance_criteria text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','active','in_review','revision','completed','blocked')),
  parent_artifact_id uuid,
  revision_cycle integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_tasks TO authenticated;
GRANT ALL ON public.studio_tasks TO service_role;
ALTER TABLE public.studio_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their studio tasks"
  ON public.studio_tasks FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER studio_tasks_updated_at
  BEFORE UPDATE ON public.studio_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Realtime
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_messages;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.studio_tasks;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_handoffs;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_events;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_intelligence;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
