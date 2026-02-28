-- Store journey route geometry as a single encoded polyline string.
-- This avoids writing thousands of Location rows in journey_points for
-- manually saved journeys while preserving full route fidelity.

ALTER TABLE public.journeys
ADD COLUMN IF NOT EXISTS route_polyline TEXT;

COMMENT ON COLUMN public.journeys.route_polyline IS
'Encoded Google polyline representing the full route geometry';
