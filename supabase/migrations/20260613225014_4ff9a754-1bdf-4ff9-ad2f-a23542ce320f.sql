ALTER TABLE public.agent_activities REPLICA IDENTITY FULL;
ALTER TABLE public.project_artifacts REPLICA IDENTITY FULL;
ALTER TABLE public.project_memory REPLICA IDENTITY FULL;
ALTER TABLE public.studio_runs REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_activities; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.project_artifacts; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.project_memory; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.studio_runs; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.projects; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;