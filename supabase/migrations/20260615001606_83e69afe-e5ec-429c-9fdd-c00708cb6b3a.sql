CREATE OR REPLACE FUNCTION public.supersede_prior_memory()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE public.project_memory
    SET status = 'superseded'
    WHERE project_id = NEW.project_id
      AND source_agent = NEW.source_agent
      AND category = NEW.category
      AND id <> NEW.id
      AND status = 'approved';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_supersede_prior_memory
AFTER INSERT OR UPDATE OF status ON public.project_memory
FOR EACH ROW EXECUTE FUNCTION public.supersede_prior_memory();

CREATE INDEX idx_project_memory_approved
ON public.project_memory(project_id, category, updated_at DESC)
WHERE status = 'approved';

DROP INDEX IF EXISTS public.idx_messages_thread;
CREATE INDEX idx_messages_thread_owner_created
ON public.messages(thread_id, owner_id, created_at DESC);