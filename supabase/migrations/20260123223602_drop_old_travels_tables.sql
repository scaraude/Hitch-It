-- Drop old travels and travel_steps tables (replaced by journeys and journey_points)

-- Drop travel_steps first (has foreign key to travels)
DROP TABLE IF EXISTS public.travel_steps CASCADE;

-- Drop travels table
DROP TABLE IF EXISTS public.travels CASCADE;
