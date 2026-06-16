
-- =========== 1. build_records: playability flag ===========
ALTER TABLE public.build_records
  ADD COLUMN IF NOT EXISTS playable BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS validation_issues JSONB NOT NULL DEFAULT '[]'::jsonb;

-- =========== 2. playtest_reports ===========
CREATE TABLE IF NOT EXISTS public.playtest_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  build_id UUID REFERENCES public.build_records(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL,
  sessions INT NOT NULL DEFAULT 0,
  win_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  softlock_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_len_ticks INT NOT NULL DEFAULT 0,
  perf_tps INT NOT NULL DEFAULT 0,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playtest_reports TO authenticated;
GRANT ALL ON public.playtest_reports TO service_role;
ALTER TABLE public.playtest_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners read own playtests" ON public.playtest_reports
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "owners insert own playtests" ON public.playtest_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

-- =========== 3. published_games ===========
CREATE TABLE IF NOT EXISTS public.published_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  build_id UUID REFERENCES public.build_records(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  kind TEXT NOT NULL DEFAULT '2d',
  template TEXT NOT NULL DEFAULT 'topdown',
  manifest JSONB NOT NULL,
  plays BIGINT NOT NULL DEFAULT 0,
  likes BIGINT NOT NULL DEFAULT 0,
  rating_avg NUMERIC(4,2) NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  staff_pick BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'public',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.published_games TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.published_games TO authenticated;
GRANT ALL ON public.published_games TO service_role;
ALTER TABLE public.published_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public games visible" ON public.published_games
  FOR SELECT TO anon, authenticated USING (status = 'public' OR auth.uid() = creator_id);
CREATE POLICY "creator inserts own game" ON public.published_games
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "creator updates own game" ON public.published_games
  FOR UPDATE TO authenticated USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "creator deletes own game" ON public.published_games
  FOR DELETE TO authenticated USING (auth.uid() = creator_id);
CREATE INDEX IF NOT EXISTS published_games_status_idx ON public.published_games(status);
CREATE INDEX IF NOT EXISTS published_games_creator_idx ON public.published_games(creator_id);
CREATE INDEX IF NOT EXISTS published_games_published_at_idx ON public.published_games(published_at DESC);

-- =========== 4. game_likes ===========
CREATE TABLE IF NOT EXISTS public.game_likes (
  user_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES public.published_games(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, game_id)
);
GRANT SELECT ON public.game_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.game_likes TO authenticated;
GRANT ALL ON public.game_likes TO service_role;
ALTER TABLE public.game_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes visible" ON public.game_likes
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "user manages own likes" ON public.game_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user deletes own likes" ON public.game_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========== 5. game_favorites ===========
CREATE TABLE IF NOT EXISTS public.game_favorites (
  user_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES public.published_games(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, game_id)
);
GRANT SELECT, INSERT, DELETE ON public.game_favorites TO authenticated;
GRANT ALL ON public.game_favorites TO service_role;
ALTER TABLE public.game_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own favorites" ON public.game_favorites
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user inserts own favorites" ON public.game_favorites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user deletes own favorites" ON public.game_favorites
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========== 6. game_ratings ===========
CREATE TABLE IF NOT EXISTS public.game_ratings (
  user_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES public.published_games(id) ON DELETE CASCADE,
  gameplay SMALLINT NOT NULL,
  fun SMALLINT NOT NULL,
  creativity SMALLINT NOT NULL,
  performance SMALLINT NOT NULL,
  visuals SMALLINT NOT NULL,
  overall SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, game_id)
);
GRANT SELECT ON public.game_ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_ratings TO authenticated;
GRANT ALL ON public.game_ratings TO service_role;
ALTER TABLE public.game_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ratings visible" ON public.game_ratings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "user manages own rating" ON public.game_ratings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user updates own rating" ON public.game_ratings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user deletes own rating" ON public.game_ratings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========== 7. game_comments ===========
CREATE TABLE IF NOT EXISTS public.game_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.published_games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  body TEXT NOT NULL,
  parent_id UUID REFERENCES public.game_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.game_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_comments TO authenticated;
GRANT ALL ON public.game_comments TO service_role;
ALTER TABLE public.game_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments visible" ON public.game_comments
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "user posts own comment" ON public.game_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user updates own comment" ON public.game_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user deletes own comment" ON public.game_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS game_comments_game_idx ON public.game_comments(game_id, created_at DESC);

-- =========== 8. game_plays ===========
CREATE TABLE IF NOT EXISTS public.game_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.published_games(id) ON DELETE CASCADE,
  user_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_s INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false
);
GRANT SELECT, INSERT ON public.game_plays TO anon;
GRANT SELECT, INSERT ON public.game_plays TO authenticated;
GRANT ALL ON public.game_plays TO service_role;
ALTER TABLE public.game_plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plays visible" ON public.game_plays
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone logs play" ON public.game_plays
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE INDEX IF NOT EXISTS game_plays_game_idx ON public.game_plays(game_id, started_at DESC);

-- =========== 9. creator_follows ===========
CREATE TABLE IF NOT EXISTS public.creator_follows (
  follower_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, creator_id),
  CHECK (follower_id <> creator_id)
);
GRANT SELECT ON public.creator_follows TO anon;
GRANT SELECT, INSERT, DELETE ON public.creator_follows TO authenticated;
GRANT ALL ON public.creator_follows TO service_role;
ALTER TABLE public.creator_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows visible" ON public.creator_follows
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "user manages own follow" ON public.creator_follows
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "user removes own follow" ON public.creator_follows
  FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- =========== 10. game_remixes ===========
CREATE TABLE IF NOT EXISTS public.game_remixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_game_id UUID NOT NULL REFERENCES public.published_games(id) ON DELETE CASCADE,
  remix_project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.game_remixes TO anon;
GRANT SELECT, INSERT ON public.game_remixes TO authenticated;
GRANT ALL ON public.game_remixes TO service_role;
ALTER TABLE public.game_remixes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "remixes visible" ON public.game_remixes
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "user records own remix" ON public.game_remixes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========== 11. game_reports ===========
CREATE TABLE IF NOT EXISTS public.game_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.published_games(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.game_reports TO authenticated;
GRANT ALL ON public.game_reports TO service_role;
ALTER TABLE public.game_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reporter reads own reports" ON public.game_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "user files own report" ON public.game_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- =========== 12. Realtime ===========
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.game_comments; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.published_games; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.playtest_reports; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
