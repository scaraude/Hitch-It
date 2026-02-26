-- Rename legacy review schema objects to comment names.
-- This migration is idempotent and only performs renames.

DO $$
BEGIN
  IF to_regclass('public.reviews') IS NOT NULL
     AND to_regclass('public.comments') IS NULL THEN
    ALTER TABLE public.reviews RENAME TO comments;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.idx_reviews_spot_id') IS NOT NULL
     AND to_regclass('public.idx_comments_spot_id') IS NULL THEN
    ALTER INDEX public.idx_reviews_spot_id RENAME TO idx_comments_spot_id;
  END IF;

  IF to_regclass('public.idx_reviews_created_at') IS NOT NULL
     AND to_regclass('public.idx_comments_created_at') IS NULL THEN
    ALTER INDEX public.idx_reviews_created_at RENAME TO idx_comments_created_at;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regprocedure('public.update_reviews_updated_at()') IS NOT NULL
     AND to_regprocedure('public.update_comments_updated_at()') IS NULL THEN
    ALTER FUNCTION public.update_reviews_updated_at() RENAME TO update_comments_updated_at;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.comments') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgrelid = 'public.comments'::regclass
      AND tgname = 'reviews_updated_at'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgrelid = 'public.comments'::regclass
      AND tgname = 'comments_updated_at'
  ) THEN
    ALTER TRIGGER reviews_updated_at ON public.comments RENAME TO comments_updated_at;
  END IF;
END $$;
