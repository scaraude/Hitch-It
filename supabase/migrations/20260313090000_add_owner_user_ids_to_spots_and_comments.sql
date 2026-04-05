ALTER TABLE public.spots
ADD COLUMN IF NOT EXISTS created_by_user_id UUID;

ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS created_by_user_id UUID;

UPDATE public.spots AS spots
SET created_by_user_id = CASE
  WHEN spots.created_by ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN spots.created_by::UUID
  ELSE profiles.id
END
FROM public.profiles AS profiles
WHERE spots.created_by_user_id IS NULL
  AND lower(trim(spots.created_by)) = lower(trim(profiles.username));

UPDATE public.spots AS spots
SET created_by_user_id = spots.created_by::UUID
WHERE spots.created_by_user_id IS NULL
  AND spots.created_by ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

UPDATE public.comments AS comments
SET created_by_user_id = CASE
  WHEN comments.created_by ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN comments.created_by::UUID
  ELSE profiles.id
END
FROM public.profiles AS profiles
WHERE comments.created_by_user_id IS NULL
  AND lower(trim(comments.created_by)) = lower(trim(profiles.username));

UPDATE public.comments AS comments
SET created_by_user_id = comments.created_by::UUID
WHERE comments.created_by_user_id IS NULL
  AND comments.created_by ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.spots
    WHERE created_by_user_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Unable to backfill spots.created_by_user_id for all rows';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.comments
    WHERE created_by_user_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Unable to backfill comments.created_by_user_id for all rows';
  END IF;
END $$;

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
