-- journey_points now stores stops only.
-- Route geometry is kept on journeys.route_polyline, so point type is redundant.

DROP INDEX IF EXISTS public.idx_journey_points_type;

ALTER TABLE public.journey_points
DROP COLUMN IF EXISTS type;