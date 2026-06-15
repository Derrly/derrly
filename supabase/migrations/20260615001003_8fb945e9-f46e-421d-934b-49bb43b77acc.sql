CREATE TABLE public.project_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.studio_runs(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL,
  health_score INTEGER NOT NULL DEFAULT 0 CHECK (health_score BETWEEN 0 AND 100),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  current_state TEXT NOT NULL DEFAULT '',
  biggest_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_systems JSONB NOT NULL DEFAULT '[]'::jsonb,
  incomplete_content JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_intelligence TO authenticated;
GRANT ALL ON public.project_intelligence TO service_role;
ALTER TABLE public.project_intelligence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_intelligence_owner_all" ON public.project_intelligence FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.quality_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.studio_runs(id) ON DELETE SET NULL,
  artifact_id UUID REFERENCES public.project_artifacts(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL,
  reviewer_agent TEXT NOT NULL DEFAULT 'qa-tester',
  discipline TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'review' CHECK (status IN ('review','approved','revision_requested','failed')),
  summary TEXT NOT NULL DEFAULT '',
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quality_reviews TO authenticated;
GRANT ALL ON public.quality_reviews TO service_role;
ALTER TABLE public.quality_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quality_reviews_owner_all" ON public.quality_reviews FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.artifact_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  artifact_id UUID NOT NULL REFERENCES public.project_artifacts(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.studio_runs(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('comment','approved','revision_requested','resolved')),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artifact_reviews TO authenticated;
GRANT ALL ON public.artifact_reviews TO service_role;
ALTER TABLE public.artifact_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "artifact_reviews_owner_all" ON public.artifact_reviews FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.build_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.studio_runs(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  status TEXT NOT NULL DEFAULT 'specification' CHECK (status IN ('specification','validating','ready','failed')),
  gameplay_overview TEXT NOT NULL DEFAULT '',
  core_loop TEXT NOT NULL DEFAULT '',
  world_overview TEXT NOT NULL DEFAULT '',
  quest_overview TEXT NOT NULL DEFAULT '',
  manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_url TEXT,
  logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.build_records TO authenticated;
GRANT ALL ON public.build_records TO service_role;
ALTER TABLE public.build_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "build_records_owner_all" ON public.build_records FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.project_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.studio_runs(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('agent','user','system')),
  actor TEXT NOT NULL,
  event_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_events TO authenticated;
GRANT ALL ON public.project_events TO service_role;
ALTER TABLE public.project_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_events_owner_all" ON public.project_events FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE INDEX idx_project_intelligence_latest ON public.project_intelligence(project_id, created_at DESC);
CREATE INDEX idx_quality_reviews_project ON public.quality_reviews(project_id, created_at DESC);
CREATE INDEX idx_quality_reviews_run ON public.quality_reviews(run_id, discipline);
CREATE INDEX idx_artifact_reviews_artifact ON public.artifact_reviews(artifact_id, created_at DESC);
CREATE INDEX idx_build_records_project ON public.build_records(project_id, created_at DESC);
CREATE INDEX idx_project_events_feed ON public.project_events(project_id, created_at DESC);
CREATE UNIQUE INDEX idx_studio_runs_one_active ON public.studio_runs(project_id) WHERE status IN ('planning','running','reviewing','revising');

CREATE TRIGGER trg_project_intelligence_updated BEFORE UPDATE ON public.project_intelligence FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_quality_reviews_updated BEFORE UPDATE ON public.quality_reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_build_records_updated BEFORE UPDATE ON public.build_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.project_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_intelligence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quality_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.build_records;