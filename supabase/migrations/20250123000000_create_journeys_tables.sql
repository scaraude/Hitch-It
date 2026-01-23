-- Create new journeys table (simplified from travels)
-- This is the central entity for recording hitchhiker trips
-- Foundation for: recording, sharing, group tracking

CREATE TABLE IF NOT EXISTS public.journeys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Recording' CHECK (status IN ('Recording', 'Paused', 'Completed')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,

    -- Enrichment (added post-trip)
    title TEXT,
    notes TEXT,

    -- Computed from points
    total_distance_km DOUBLE PRECISION,

    -- Future: sharing (F5, F6)
    is_shared BOOLEAN DEFAULT false,
    share_token TEXT UNIQUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create journey_points table (GPS path + stops)
CREATE TABLE IF NOT EXISTS public.journey_points (
    id TEXT PRIMARY KEY,
    journey_id TEXT NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'Location' CHECK (type IN ('Location', 'Stop')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,

    -- Enrichment for Stop type (added post-trip in F12)
    spot_id TEXT REFERENCES public.spots(id) ON DELETE SET NULL,
    wait_time_minutes INTEGER,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_journeys_user_id ON public.journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_journeys_status ON public.journeys(status);
CREATE INDEX IF NOT EXISTS idx_journeys_started_at ON public.journeys(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_journey_points_journey_id ON public.journey_points(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_points_timestamp ON public.journey_points(timestamp);
CREATE INDEX IF NOT EXISTS idx_journey_points_type ON public.journey_points(type) WHERE type = 'Stop';

-- Enable RLS
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for journeys
CREATE POLICY "Users can read their own journeys"
    ON public.journeys FOR SELECT
    USING (true); -- For now, allow all reads (will restrict later with auth)

CREATE POLICY "Users can insert their own journeys"
    ON public.journeys FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own journeys"
    ON public.journeys FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete their own journeys"
    ON public.journeys FOR DELETE
    USING (true);

-- RLS Policies for journey_points
CREATE POLICY "Users can read journey points"
    ON public.journey_points FOR SELECT
    USING (true);

CREATE POLICY "Users can insert journey points"
    ON public.journey_points FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update journey points"
    ON public.journey_points FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete journey points"
    ON public.journey_points FOR DELETE
    USING (true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_journeys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for journeys updated_at
DROP TRIGGER IF EXISTS journeys_updated_at ON public.journeys;
CREATE TRIGGER journeys_updated_at
    BEFORE UPDATE ON public.journeys
    FOR EACH ROW
    EXECUTE FUNCTION public.update_journeys_updated_at();
