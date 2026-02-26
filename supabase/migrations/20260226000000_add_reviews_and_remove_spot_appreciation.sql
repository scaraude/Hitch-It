-- Move appreciation out of spots and into reviews/comments
ALTER TABLE public.spots
DROP COLUMN IF EXISTS appreciation;

CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  appreciation TEXT NOT NULL CHECK (appreciation IN ('perfect', 'good', 'bad')),
  comment TEXT NOT NULL CHECK (char_length(trim(comment)) > 0),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_spot_id ON public.reviews(spot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
      AND policyname = 'Allow anon read/write'
  ) THEN
    CREATE POLICY "Allow anon read/write" ON public.reviews
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_updated_at ON public.reviews;
CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reviews_updated_at();
