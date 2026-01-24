# Feature 11: Journey Recording

**Status**: ✅ **COMPLETE** - Redesigned and implemented on January 23, 2026

**Goal**: Simple GPS path recorder for hitchhiking trips with manual stop marking.

> **Note**: Previous implementation (v1) was over-engineered with automatic state detection.
> This version (v2) is simplified: just record GPS path + let user mark stops manually.

---

## ✨ Implementation Summary (v2)

**Module**: `src/journey/`

**Components**:
- `JourneyRecordingButton` - Start/pause/stop recording FAB
- `ActiveJourneyIndicator` - Shows recording status, duration, stops count
- `MarkStopButton` - User marks current position as a stop

**Services**:
- `locationTrackingService` - Background/foreground GPS tracking (unchanged from v1)
- `journeyRepository` - Supabase persistence for journeys + points

**Context**: `JourneyProvider` - Simplified state management (no auto-detection)

**Features**:
- ✅ Battery-efficient GPS tracking (5s/50m intervals)
- ✅ Manual stop marking (user decides when they stopped)
- ✅ Background recording survives app restarts
- ✅ Points batched for efficient DB writes
- ✅ TypeScript branded types for safety
- ✅ Full French localization

**Dependencies**: `expo-task-manager`, `expo-location`

---

## Concept (Simplified)

Record the hitchhiker's journey as a GPS path, with user-marked stops:
- **Simple recording** - Just track GPS coordinates over time
- **Manual stops** - User marks when they stop (no automatic detection)
- **Post-trip enrichment** - Add spot links, notes, ratings after journey (F12)
- **Foundation for sharing** - Same Journey entity powers F5 (Group) & F6 (External sharing)

```
┌────────────────────────────────┐
│ 🔴 Enregistrement   00:45      │
│ ─────────────────              │
│ Durée: 2h15  |  Arrêts: 3      │
└────────────────────────────────┘

        [📍 Arrêt]

      [🎬 Enregistrer]
```

---

## Data Model

```typescript
// Simplified domain model
interface Journey {
  id: JourneyId;
  userId: UserId;
  status: 'Recording' | 'Paused' | 'Completed';
  startedAt: Date;
  endedAt?: Date;
  points: JourneyPoint[];
  title?: string;  // Added post-trip
  notes?: string;  // Added post-trip
}

interface JourneyPoint {
  id: JourneyPointId;
  journeyId: JourneyId;
  type: 'Location' | 'Stop';  // Location = GPS, Stop = user-marked
  latitude: number;
  longitude: number;
  timestamp: Date;
  // Stop enrichment (added post-trip in F12)
  spotId?: SpotId;
  waitTimeMinutes?: number;
  notes?: string;
}
```

---

## Database Schema

```sql
-- journeys table
CREATE TABLE journeys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,  -- Recording, Paused, Completed
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  title TEXT,
  notes TEXT,
  total_distance_km DOUBLE PRECISION,
  is_shared BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE
);

-- journey_points table
CREATE TABLE journey_points (
  id TEXT PRIMARY KEY,
  journey_id TEXT REFERENCES journeys(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- Location, Stop
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  spot_id TEXT REFERENCES spots(id),
  wait_time_minutes INTEGER,
  notes TEXT
);
```

---

## UI Flow

**During Trip**:
1. Tap "Enregistrer" to start GPS recording
2. Indicator shows duration and stops count
3. Tap "📍 Arrêt" when you stop hitchhiking
4. Long-press recording button to stop

**After Trip** (F12 scope):
- Review journey path on map
- Enrich stops with spot links
- Add notes and title
- View statistics

---

## Completed Tasks (v2)

- [x] Create `src/journey/` feature module (DDD structure)
- [x] Implement background location tracking service
- [x] Build `JourneyRecordingButton` component (start/pause/stop FAB)
- [x] Build `ActiveJourneyIndicator` component (status bar)
- [x] Build `MarkStopButton` component (manual stop marking)
- [x] Create `JourneyProvider` context (simplified, no auto-detection)
- [x] Integrate journey UI into HomeScreen
- [x] Create new database tables (`journeys`, `journey_points`)
- [x] Implement journey persistence via journeyRepository

---

## Database Tables (v2)

- ✅ `journeys` table with RLS policies
- ✅ `journey_points` table (Location + Stop types)
- ✅ Proper indexes for performance
- ⚠️ Old tables (`travels`, `travel_steps`) to be removed later

---

## Files Removed (v1 over-engineering)

- `journeyDetector.ts` - Auto state detection
- `NavigationBar.tsx`, `NavigationSheet.tsx` - Complex navigation UI
- `JourneyTimeline.tsx`, `VehicleChangePrompt.tsx` - Auto-detection UI
