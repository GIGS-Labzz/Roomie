-- ─── Posts ───────────────────────────────────────────────────────────────────

CREATE TABLE public.posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  city            TEXT,
  budget_min      INTEGER,
  budget_max      INTEGER,
  move_in_date    DATE,
  likes_count     INTEGER DEFAULT 0,
  comments_count  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_user_id ON public.posts(user_id);

-- ─── Post Likes ───────────────────────────────────────────────────────────────

CREATE TABLE public.post_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- ─── Post Comments ────────────────────────────────────────────────────────────

CREATE TABLE public.post_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 300),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id, created_at ASC);

-- ─── Row-Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments  ENABLE ROW LEVEL SECURITY;

-- Posts: anyone can read, authenticated users can create/delete their own
CREATE POLICY "posts_read_all"    ON public.posts FOR SELECT USING (TRUE);
CREATE POLICY "posts_insert_own"  ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete_own"  ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Post likes: anyone can read, authenticated users manage their own
CREATE POLICY "post_likes_read_all"   ON public.post_likes FOR SELECT USING (TRUE);
CREATE POLICY "post_likes_insert_own" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_delete_own" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Post comments: anyone can read, authenticated users create/delete their own
CREATE POLICY "post_comments_read_all"   ON public.post_comments FOR SELECT USING (TRUE);
CREATE POLICY "post_comments_insert_own" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_comments_delete_own" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- ─── Triggers — keep denormalized counts in sync ─────────────────────────────

CREATE OR REPLACE FUNCTION public.inc_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER post_likes_inserted
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.inc_post_likes_count();

CREATE OR REPLACE FUNCTION public.dec_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER post_likes_deleted
  AFTER DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.dec_post_likes_count();

CREATE OR REPLACE FUNCTION public.inc_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER post_comments_inserted
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.inc_post_comments_count();

-- Auto-update updated_at on posts
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
