-- Ensure journey_points are cascade-deleted when their parent journey is deleted.
-- This migration re-creates the foreign key with ON DELETE CASCADE to cover
-- environments where the constraint was created without the cascade action.

ALTER TABLE public.journey_points
  DROP CONSTRAINT IF EXISTS journey_points_journey_id_fkey;

ALTER TABLE public.journey_points
  ADD CONSTRAINT journey_points_journey_id_fkey
  FOREIGN KEY (journey_id)
  REFERENCES public.journeys(id)
  ON DELETE CASCADE;
