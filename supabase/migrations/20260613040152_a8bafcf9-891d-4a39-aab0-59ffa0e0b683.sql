CREATE TABLE public.project_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('brief','vision','story','world','npcs','quests','maps','systems','assets','testing','revision','decision')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_agent TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('draft','review','approved','superseded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_memory TO authenticated;
GRANT ALL ON public.project_memory TO service_role;
ALTER TABLE public.project_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_memory_owner_all" ON public.project_memory FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.studio_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','running','reviewing','revising','completed','failed')),
  phase TEXT NOT NULL DEFAULT 'briefing',
  task_graph JSONB NOT NULL DEFAULT '[]'::jsonb,
  revision_count INTEGER NOT NULL DEFAULT 0 CHECK (revision_count >= 0),
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_runs TO authenticated;
GRANT ALL ON public.studio_runs TO service_role;
ALTER TABLE public.studio_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "studio_runs_owner_all" ON public.studio_runs FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.agent_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.studio_runs(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  agent TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('planning','working','handoff','review','revision','approval','build','system')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('queued','active','completed','blocked','failed')),
  summary TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  sequence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_activities TO authenticated;
GRANT ALL ON public.agent_activities TO service_role;
ALTER TABLE public.agent_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_activities_owner_all" ON public.agent_activities FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.agent_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.studio_runs(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('context','output','review','revision','trigger')),
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_memory_id UUID REFERENCES public.project_memory(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','received','accepted','revision_requested','resolved')),
  response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_handoffs TO authenticated;
GRANT ALL ON public.agent_handoffs TO service_role;
ALTER TABLE public.agent_handoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_handoffs_owner_all" ON public.agent_handoffs FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.project_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.studio_runs(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL,
  artifact_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  produced_by TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  review_status TEXT NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft','in_review','revision_requested','approved')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_artifacts TO authenticated;
GRANT ALL ON public.project_artifacts TO service_role;
ALTER TABLE public.project_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_artifacts_owner_all" ON public.project_artifacts FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE INDEX idx_project_memory_project ON public.project_memory(project_id, category, updated_at DESC);
CREATE INDEX idx_studio_runs_project ON public.studio_runs(project_id, created_at DESC);
CREATE INDEX idx_agent_activities_feed ON public.agent_activities(project_id, created_at DESC);
CREATE INDEX idx_agent_activities_run ON public.agent_activities(run_id, sequence);
CREATE INDEX idx_agent_handoffs_run ON public.agent_handoffs(run_id, created_at);
CREATE INDEX idx_project_artifacts_project ON public.project_artifacts(project_id, updated_at DESC);

CREATE TRIGGER trg_project_memory_updated BEFORE UPDATE ON public.project_memory FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_studio_runs_updated BEFORE UPDATE ON public.studio_runs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_project_artifacts_updated BEFORE UPDATE ON public.project_artifacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();