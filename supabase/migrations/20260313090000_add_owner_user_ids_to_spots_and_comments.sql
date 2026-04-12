DELETE FROM public.comments;
DELETE FROM public.spots;

ALTER TABLE public.spots
DROP COLUMN IF EXISTS created_by,
ADD COLUMN IF NOT EXISTS created_by_user_id UUID;

ALTER TABLE public.comments
DROP COLUMN IF EXISTS created_by,
ADD COLUMN IF NOT EXISTS created_by_user_id UUID;
ALTER TABLE public.spots
ALTER COLUMN created_by_user_id SET NOT NULL;

ALTER TABLE public.comments
ALTER COLUMN created_by_user_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'spots_created_by_user_id_fkey'
  ) THEN
    ALTER TABLE public.spots
    ADD CONSTRAINT spots_created_by_user_id_fkey
    FOREIGN KEY (created_by_user_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'comments_created_by_user_id_fkey'
  ) THEN
    ALTER TABLE public.comments
    ADD CONSTRAINT comments_created_by_user_id_fkey
    FOREIGN KEY (created_by_user_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS spots_created_by_user_id_idx
ON public.spots (created_by_user_id);

CREATE INDEX IF NOT EXISTS comments_created_by_user_id_idx
ON public.comments (created_by_user_id);
