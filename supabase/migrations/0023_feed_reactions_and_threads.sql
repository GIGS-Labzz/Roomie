-- Add parent_post_id to posts for reply threads
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS parent_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON public.posts(parent_post_id);

-- Add reactions JSONB column to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reactions JSONB NOT NULL DEFAULT '{"love": 0, "laughter": 0, "confusion": 0, "applause": 0, "anger": 0}'::jsonb;

-- Add type column to post_likes
ALTER TABLE public.post_likes ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'love';

-- Backfill existing likes as 'love' and update the reactions counts JSON on posts
UPDATE public.post_likes SET type = 'love' WHERE type IS NULL OR type = '';

WITH reaction_counts AS (
  SELECT
    post_id,
    jsonb_build_object(
      'love', count(CASE WHEN type = 'love' THEN 1 END),
      'laughter', count(CASE WHEN type = 'laughter' THEN 1 END),
      'confusion', count(CASE WHEN type = 'confusion' THEN 1 END),
      'applause', count(CASE WHEN type = 'applause' THEN 1 END),
      'anger', count(CASE WHEN type = 'anger' THEN 1 END)
    ) AS counts
  FROM public.post_likes
  GROUP BY post_id
)
UPDATE public.posts p
SET reactions = rc.counts
FROM reaction_counts rc
WHERE p.id = rc.post_id;

-- Drop old count-based triggers
DROP TRIGGER IF EXISTS post_likes_inserted ON public.post_likes;
DROP TRIGGER IF EXISTS post_likes_deleted ON public.post_likes;
DROP FUNCTION IF EXISTS public.inc_post_likes_count();
DROP FUNCTION IF EXISTS public.dec_post_likes_count();

-- Create unified reaction change trigger function
CREATE OR REPLACE FUNCTION public.handle_post_reaction_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts
    SET
      likes_count = likes_count + 1,
      reactions = jsonb_set(
        reactions,
        ARRAY[NEW.type],
        to_jsonb(COALESCE((reactions->>NEW.type)::int, 0) + 1)
      )
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts
    SET
      likes_count = GREATEST(0, likes_count - 1),
      reactions = jsonb_set(
        reactions,
        ARRAY[OLD.type],
        to_jsonb(GREATEST(0, COALESCE((reactions->>OLD.type)::int, 0) - 1))
      )
    WHERE id = OLD.post_id;
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE public.posts
    SET
      reactions = jsonb_set(
        jsonb_set(
          reactions,
          ARRAY[OLD.type],
          to_jsonb(GREATEST(0, COALESCE((reactions->>OLD.type)::int, 0) - 1))
        ),
        ARRAY[NEW.type],
        to_jsonb(COALESCE((reactions->>NEW.type)::int, 0) + 1)
      )
    WHERE id = NEW.post_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create triggers
CREATE TRIGGER post_reaction_inserted
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_reaction_change();

CREATE TRIGGER post_reaction_deleted
  AFTER DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_reaction_change();

CREATE TRIGGER post_reaction_updated
  AFTER UPDATE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_reaction_change();
