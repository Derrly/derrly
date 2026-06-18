
-- Tighten game_plays insert policy
DROP POLICY IF EXISTS "anyone logs play" ON public.game_plays;
CREATE POLICY "log play scoped to caller" ON public.game_plays
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- Revoke EXECUTE on SECURITY DEFINER trigger function from API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
