-- Add index for efficient location-based queries
-- This enables fast viewport-based filtering for spots
CREATE INDEX IF NOT EXISTS idx_spots_location
ON spots (latitude, longitude);