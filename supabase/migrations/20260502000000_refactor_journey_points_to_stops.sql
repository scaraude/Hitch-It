-- Refactor: split route trace from stops in the journey model.
--
-- After this migration:
-- - journey.route_polyline is the single source of truth for the GPS trace
-- - The renamed journey_stops table represents stops only (ride changes)
-- - The redundant `type` column is gone (every row now means "stop")

-- 1. Drop the type column + its partial index
DROP INDEX IF EXISTS public.idx_journey_points_type;
ALTER TABLE public.journey_points
  DROP COLUMN IF EXISTS type;

-- 2. Rename the table
ALTER TABLE public.journey_points RENAME TO journey_stops;

-- 3. Rename indexes to match
ALTER INDEX IF EXISTS public.idx_journey_points_journey_id
  RENAME TO idx_journey_stops_journey_id;
ALTER INDEX IF EXISTS public.idx_journey_points_timestamp
  RENAME TO idx_journey_stops_timestamp;

-- 4. Rename the FK constraint
ALTER TABLE public.journey_stops
  RENAME CONSTRAINT journey_points_journey_id_fkey
  TO journey_stops_journey_id_fkey;

-- 5. Replace RLS policies (policies reference the old table name in the
--    USING/WITH CHECK clauses are evaluated by name, but the policy
--    objects themselves were created against journey_points and the
--    rename auto-migrates them; the names alone need refreshing for
--    clarity). Drop & recreate for unambiguous naming.
DROP POLICY IF EXISTS "Users can read journey points" ON public.journey_stops;
DROP POLICY IF EXISTS "Users can insert journey points" ON public.journey_stops;
DROP POLICY IF EXISTS "Users can update journey points" ON public.journey_stops;
DROP POLICY IF EXISTS "Users can delete journey points" ON public.journey_stops;

CREATE POLICY "Users can read journey stops"
    ON public.journey_stops FOR SELECT
    USING (true);

CREATE POLICY "Users can insert journey stops"
    ON public.journey_stops FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update journey stops"
    ON public.journey_stops FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete journey stops"
    ON public.journey_stops FOR DELETE
    USING (true);
