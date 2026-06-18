CREATE POLICY "Users update own plays" ON public.game_plays
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own plays" ON public.game_plays
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own remixes" ON public.game_remixes
FOR DELETE TO authenticated
USING (auth.uid() = user_id);
