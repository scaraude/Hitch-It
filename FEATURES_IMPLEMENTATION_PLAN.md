# Hitch-It Features Implementation Plan

> Advanced features roadmap for the hitchhiking companion app
> Date: January 2026

---

## Overview

This plan details the implementation of **advanced features** to transform Hitch-It from a spot-sharing app into a comprehensive hitchhiking companion. Features are organized by domain and prioritized by user impact.

---

## Feature 1: Spot Pictures

**Goal**: Allow users to visualize spots before arriving with photos.

### 1.1 Data Model

```typescript
// src/spot/types.ts
interface SpotPicture {
  id: SpotPictureId;
  spotId: SpotId;
  source: PictureSource;
  url: string;
  thumbnailUrl?: string;
  uploadedBy?: UserId;
  createdAt: Date;
}

enum PictureSource {
  GoogleStreetView = "GoogleStreetView",
  UserUpload = "UserUpload",
}
```

### 1.2 Google Street View Integration

- [ ] Create `src/spot/services/streetViewService.ts`
- [ ] Fetch Street View Static API images based on spot coordinates
- [ ] Cache images locally for offline access
- [ ] Handle cases where Street View is unavailable

```typescript
// src/spot/services/streetViewService.ts
const STREET_VIEW_API = "https://maps.googleapis.com/maps/api/streetview";

export const getStreetViewUrl = (lat: number, lng: number): string => {
  return `${STREET_VIEW_API}?size=600x400&location=${lat},${lng}&key=${GOOGLE_API_KEY}`;
};

export const checkStreetViewAvailability = async (
  lat: number,
  lng: number
): Promise<boolean> => {
  // Use Street View Metadata API to check availability
};
```

### 1.3 User Photo Upload

- [ ] Create `SpotPhotoUploader` component
- [ ] Integrate `expo-image-picker` for camera/gallery access
- [ ] Implement image compression before upload
- [ ] Create `src/spot/services/imageUploadService.ts`
- [ ] Add photo moderation queue (flag inappropriate content)

### 1.4 UI Components

- [ ] Create `SpotGallery` component with horizontal scroll
- [ ] Add photo viewer modal with zoom/pan
- [ ] Show Street View badge vs User Photo badge
- [ ] Add "Add Photo" button in SpotDetailsSheet

### 1.5 Database Schema

```sql
CREATE TABLE IF NOT EXISTS spot_pictures (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL REFERENCES spots(id),
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_by TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
);
```

---

## Feature 2: Highway Rest Areas Database

**Goal**: Pre-populate all French highway rest areas ("aires de repos") as potential hitchhiking spots.

### 2.1 Data Source

- [ ] Source data from OpenStreetMap (amenity=rest_area + highway=services)
- [ ] Include: name, coordinates, highway reference, facilities
- [ ] Create import script `scripts/import-rest-areas.ts`

### 2.2 Data Model

```typescript
// src/restArea/types.ts
interface RestArea {
  id: RestAreaId;
  name: string;
  coordinates: Coordinates;
  highway: string; // e.g., "A10", "A63"
  direction: Direction;
  facilities: Facility[];
  linkedSpotId?: SpotId; // User-created spot at this location
}

enum Facility {
  Fuel = "Fuel",
  Restaurant = "Restaurant",
  Toilets = "Toilets",
  Parking = "Parking",
  Picnic = "Picnic",
  Hotel = "Hotel",
}
```

### 2.3 Implementation

- [ ] Create `src/restArea/` feature module
- [ ] Import ~400 French rest areas into local database
- [ ] Show rest areas on map with distinct marker style
- [ ] Allow converting rest area to hitchhiking spot
- [ ] Link existing spots to nearby rest areas automatically

### 2.4 Offline Data

- [ ] Bundle rest area data with app (static JSON)
- [ ] Update via OTA when new rest areas added
- [ ] ~50KB compressed dataset

---

## Feature 3: Double Itinerary Calculator

**Goal**: Calculate parallel routes for hitchhiker and driver to find the last common spot.

### 3.1 Concept

```
Hitchhiker: Bordeaux → Bayonne (A63)
Driver: Bordeaux → Pau (A64)

Common path: Bordeaux → Aire de Labenne (A63/A64 split)
Suggestion: "Get dropped at Aire de Labenne to continue south"
```

### 3.2 Implementation

- [ ] Create `src/routing/` feature module
- [ ] Integrate routing API (Mapbox Directions / OpenRouteService)
- [ ] Implement path intersection algorithm
- [ ] Find optimal drop-off point (last common exit/rest area)

```typescript
// src/routing/services/routeService.ts
interface DoubleRouteResult {
  hitchhikerRoute: Route;
  driverRoute: Route;
  commonPath: Coordinates[];
  lastCommonSpot: Spot | RestArea | null;
  splitPoint: Coordinates;
  driverDetourMinutes: number;
}

export const calculateDoubleRoute = async (
  hitchhikerOrigin: Coordinates,
  hitchhikerDestination: Coordinates,
  driverDestination: Coordinates
): Promise<DoubleRouteResult> => {
  // 1. Get both routes
  // 2. Find intersection points
  // 3. Identify last common spot before split
  // 4. Calculate detour time for driver
};
```

### 3.3 UI Components

- [ ] Create `DoubleRouteSheet` bottom sheet
- [ ] Show both routes on map with different colors
- [ ] Highlight common path segment
- [ ] Mark suggested drop-off point
- [ ] Display "X min detour for driver" info

---

## Feature 4: Longway - Extended Drop-off Suggestions

**Goal**: Help drivers go a bit further to leave hitchhiker at better spots.

### 4.1 Concept

```
Driver destination: Dax
Hitchhiker destination: Bayonne (30min further)

Longway suggestions:
- "Aire de Saubrigues" (7min detour) - Good spot
- "Sortie Bayonne Nord" (12min detour) - Near destination
```

### 4.2 Configuration

```typescript
// src/constants/routing.ts
export const LONGWAY_CONFIG = {
  nearbySpotMaxDetourMinutes: 7,
  destinationMaxDetourMinutes: 15,
  searchRadiusKm: 20,
} as const;
```

### 4.3 Implementation

- [ ] Extend route service with `findLongwayOptions()`
- [ ] Search for spots within detour radius
- [ ] Calculate actual detour time (not straight-line distance)
- [ ] Rank suggestions by: spot quality + detour efficiency

```typescript
interface LongwayOption {
  spot: Spot | RestArea;
  detourMinutes: number;
  distanceToFinalDestination: number;
  recommendation: "nearby_spot" | "near_destination";
}

export const findLongwayOptions = async (
  driverDestination: Coordinates,
  hitchhikerDestination: Coordinates,
  currentRoute: Route
): Promise<LongwayOption[]> => {
  // Find spots beyond driver destination
  // Calculate detour times
  // Filter by max detour config
  // Sort by efficiency
};
```

### 4.4 UI

- [ ] Add "Longway" toggle in route planning
- [ ] Show suggestions as chips: "Aire de X (+5min)"
- [ ] Explain benefit to driver: "Help them reach a better spot"

---

## Feature 5: Group Tracking

**Goal**: Allow hitchhikers traveling together to see each other's location.

### 5.1 Data Model

```typescript
// src/group/types.ts
interface TravelGroup {
  id: GroupId;
  name: string;
  createdBy: UserId;
  members: GroupMember[];
  createdAt: Date;
  expiresAt: Date; // Auto-delete after trip
}

interface GroupMember {
  userId: UserId;
  displayName: string;
  lastLocation?: LocationUpdate;
  status: MemberStatus;
}

enum MemberStatus {
  Active = "Active",
  Paused = "Paused", // Not sharing location
  InVehicle = "InVehicle",
  AtSpot = "AtSpot",
}
```

### 5.2 Implementation

- [ ] Create `src/group/` feature module
- [ ] Real-time location sync (Firebase Realtime DB / Supabase Realtime)
- [ ] Background location updates with `expo-location`
- [ ] Battery-efficient tracking (significant location changes only)

### 5.3 Features

- [ ] Create/join group with invite code
- [ ] See all members on map
- [ ] Pause/resume location sharing
- [ ] Auto-detect status (moving = in vehicle, stationary at spot)
- [ ] Group chat (simple text messages)
- [ ] Group expiration (24h/48h/1 week)

### 5.4 Privacy

- [ ] Explicit consent to share location
- [ ] Easy toggle to stop sharing
- [ ] No location history stored (only current position)
- [ ] Group auto-deletes after expiration

---

## Feature 6: External Location Sharing

**Goal**: Share real-time location with non-app users (family, friends).

### 6.1 Concept

```
Hitchhiker generates a secure link:
https://hitchit.app/track/abc123

Anyone with link can see:
- Current location on map
- Last update time
- "En route vers Bayonne"
- Battery level indicator
```

### 6.2 Implementation

- [ ] Create `src/sharing/` feature module
- [ ] Generate unique, time-limited tracking links
- [ ] Web viewer page (no app required)
- [ ] Configurable expiration (1h, 6h, 24h, trip duration)

```typescript
// src/sharing/types.ts
interface TrackingLink {
  id: string;
  userId: UserId;
  token: string; // Secure random token
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  viewCount: number;
}
```

### 6.3 Security

- [ ] Links expire automatically
- [ ] User can revoke link anytime
- [ ] Rate limit link generation
- [ ] No personal info exposed (just location + destination)
- [ ] Optional PIN protection

### 6.4 UI

- [ ] "Share my location" button in navigation mode
- [ ] Copy link / share via native share sheet
- [ ] Active shares list with revoke option
- [ ] "X people viewing your location" indicator

---

## Feature 7: Dynamic Destination Suggestions ("Objectif")

**Goal**: Suggest destination "themes" based on direction, not just city names.

### 7.1 Concept

When hitchhiker is at a spot for 5+ minutes, show popup:

```
Vous allez vers...
┌─────────────────────────────────┐
│ 🌊 La Côte Basque               │
│ 🌲 Les Landes                   │
│ ☀️ Le Sud                       │
│ 🏔️ Les Pyrénées                │
│ 📍 Bayonne (votre destination)  │
└─────────────────────────────────┘

"À dire au conducteur pour augmenter vos chances"
```

### 7.2 Data Model

```typescript
// src/destination/types.ts
interface DestinationTheme {
  id: string;
  name: string;
  emoji: string;
  region: string;
  keywords: string[]; // For search
  boundingBox: BoundingBox;
  majorCities: string[];
}

// Pre-defined themes
const THEMES: DestinationTheme[] = [
  {
    id: "cote-basque",
    name: "La Côte Basque",
    emoji: "🌊",
    region: "Nouvelle-Aquitaine",
    keywords: ["biarritz", "bayonne", "saint-jean-de-luz", "hendaye"],
    // ...
  },
  // ...
];
```

### 7.3 Implementation

- [ ] Create `src/destination/` feature module
- [ ] Define ~30 French destination themes
- [ ] Algorithm to suggest relevant themes based on:
  - Current location
  - User's final destination
  - Spot direction
  - Common routes from this spot

### 7.4 Trigger Logic

```typescript
// Show popup when:
const shouldShowObjectif = (
  timeAtSpot: number,
  hasShownRecently: boolean,
  isInNavigationMode: boolean
): boolean => {
  return (
    timeAtSpot >= 5 * 60 * 1000 && // 5 minutes
    !hasShownRecently &&
    isInNavigationMode
  );
};
```

### 7.5 UI

- [ ] Bottom popup with theme suggestions
- [ ] Tap to copy theme name
- [ ] "Use this" updates displayed destination
- [ ] Dismissible, remembers preference
- [ ] Settings to enable/disable

---

## Feature 8: User Profile & Travel History

**Goal**: Let users track their hitchhiking journeys and stats.

### 8.1 Data Model

```typescript
// src/user/types.ts
interface UserProfile {
  id: UserId;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  stats: UserStats;
  badges: Badge[];
  travelHistory: Travel[];
}

interface UserStats {
  totalDistance: number; // km
  totalTravels: number;
  totalWaitTime: number; // minutes
  averageWaitTime: number;
  countriesVisited: string[];
  spotsUsed: number;
  spotsCreated: number;
}

interface Travel {
  id: TravelId;
  userId: UserId;
  startDate: Date;
  endDate?: Date;
  origin: string;
  destination: string;
  status: TravelStatus;
  steps: TravelStep[];
  totalDistance: number;
  totalWaitTime: number;
}

interface TravelStep {
  id: TravelStepId;
  travelId: TravelId;
  type: StepType;
  spot?: Spot;
  startTime: Date;
  endTime?: Date;
  notes?: string;
}

enum StepType {
  Waiting = "Waiting", // At spot
  InVehicle = "InVehicle",
  Walking = "Walking",
  Break = "Break",
}

enum TravelStatus {
  InProgress = "InProgress",
  Completed = "Completed",
  Abandoned = "Abandoned",
}
```

### 8.2 Implementation

- [ ] Create `src/user/` feature module
- [ ] Profile screen with stats dashboard
- [ ] Travel list with expandable details
- [ ] Manual travel logging (for past trips)
- [ ] Auto-detection during navigation (see Feature 11)

### 8.3 Stats Display

- [ ] Total km hitchhiked
- [ ] Average wait time
- [ ] Best/worst spots used
- [ ] Monthly/yearly breakdown
- [ ] Achievements unlocked

---

## Feature 9: Community Section

**Goal**: Build a hitchhiker community with advice, stories, and chat.

### 9.1 Sections

```
Community
├── 💡 Conseils (Tips)
│   ├── Pour débutants
│   ├── Équipement
│   ├── Sécurité
│   └── Par région
├── 💬 Forum
│   ├── Questions
│   ├── Récits de voyage
│   └── Rencontres
├── 📖 Histoires (Stories)
│   └── User-submitted travel stories
└── 🗺️ Guides régionaux
    └── Community-written area guides
```

### 9.2 Data Model

```typescript
// src/community/types.ts
interface Post {
  id: PostId;
  type: PostType;
  title: string;
  content: string;
  authorId: UserId;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  commentCount: number;
  isPinned: boolean;
}

enum PostType {
  Tip = "Tip",
  Question = "Question",
  Story = "Story",
  Guide = "Guide",
}
```

### 9.3 Features

- [ ] Browse/search posts by category
- [ ] Create posts (markdown support)
- [ ] Comment and like system
- [ ] Report inappropriate content
- [ ] Moderation queue
- [ ] Push notifications for replies

### 9.4 Moderation

- [ ] Community guidelines
- [ ] Report system
- [ ] Moderator roles
- [ ] Auto-flag suspicious content
- [ ] Ban system for repeat offenders

---

## Feature 10: User Badges & Gamification

**Goal**: Reward active users and encourage positive behavior.

### 10.1 Badge Categories

```typescript
// src/badges/types.ts
interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  tier: BadgeTier;
  requirement: BadgeRequirement;
  unlockedAt?: Date;
}

enum BadgeCategory {
  Distance = "Distance",
  Community = "Community",
  Explorer = "Explorer",
  Helper = "Helper",
  Veteran = "Veteran",
}

enum BadgeTier {
  Bronze = "Bronze",
  Silver = "Silver",
  Gold = "Gold",
  Platinum = "Platinum",
}
```

### 10.2 Example Badges

| Badge                  | Requirement                   | Tier     |
| ---------------------- | ----------------------------- | -------- |
| Premier Pouce          | Complete first trip           | Bronze   |
| Routard                | 1,000 km hitchhiked           | Bronze   |
| Grand Voyageur         | 10,000 km hitchhiked          | Gold     |
| Cartographe            | Create 10 spots               | Silver   |
| Guide Local            | 50 spots created              | Gold     |
| Contributeur           | 100 helpful comments          | Silver   |
| Mentor                 | Help 10 beginners in forum    | Gold     |
| Explorateur            | Visit all French regions      | Platinum |
| Noctambule             | 10 night trips                | Silver   |
| Patience               | Wait 3h+ and still get a ride | Bronze   |
| Sans Frontières        | Cross 5 country borders       | Gold     |
| Communauté             | Post 50 times in forum        | Silver   |
| Photographe            | Upload 100 spot photos        | Gold     |

### 10.3 Implementation

- [ ] Create `src/badges/` feature module
- [ ] Badge progress tracking
- [ ] Unlock notifications with animation
- [ ] Badge display on profile
- [ ] Leaderboards (optional, opt-in)

---

## Feature 11: Journey Recording & Navigation

**Goal**: Passive navigation that records your journey like a flight tracker.

### 11.1 Concept

Unlike car GPS, hitchhiking navigation is passive:
- No turn-by-turn directions
- Show your route, not commands
- Auto-detect vehicle changes (stopped for X minutes = new ride)
- Record journey for later review

```
┌────────────────────────────────┐
│ 🧭 En route vers Bayonne       │
│                                │
│    Bordeaux                    │
│        ↓ (Voiture 1)           │
│    Aire de Cestas              │
│        ↓ (Voiture 2)           │
│    📍 Position actuelle        │
│        ⋮                       │
│    Bayonne                     │
│                                │
│ ══════════════════             │
│ 180 km parcourus | 2h15        │
│ Arrivée estimée: 16h30         │
└────────────────────────────────┘
```

### 11.2 Implementation

- [ ] Create `src/navigation/` feature module
- [ ] Background location tracking (battery-efficient)
- [ ] Vehicle change detection algorithm:
  - Stationary for > 3 min at spot = waiting
  - Stationary for > 10 min elsewhere = break
  - Moving = in vehicle

```typescript
// src/navigation/services/journeyDetector.ts
interface JourneyState {
  status: "idle" | "waiting" | "in_vehicle" | "break";
  currentStep: TravelStep;
  detectedVehicleChanges: number;
  startTime: Date;
}

const DETECTION_CONFIG = {
  waitingThresholdMinutes: 3,
  breakThresholdMinutes: 10,
  movingSpeedThresholdKmh: 15,
  spotProximityMeters: 100,
};
```

### 11.3 UI Components

- [ ] `NavigationBar` - Compact top bar showing progress
- [ ] `JourneyTimeline` - Vertical list of steps
- [ ] `NavigationSheet` - Full journey details
- [ ] `VehicleChangePrompt` - "Nouveau véhicule détecté?"

### 11.4 Post-Journey Editing

- [ ] Review detected steps
- [ ] Correct misdetections (pause vs. vehicle change)
- [ ] Add notes to each step
- [ ] Rate spots used during journey
- [ ] Save to travel history

---

## Feature 12: Save Journey Feature

**Goal**: After completing a trip, save and correct the recorded journey.

### 12.1 Flow

```
Journey Complete!
┌──────────────────────────────────┐
│ Bordeaux → Bayonne               │
│ 3h45 | 4 véhicules | 185 km      │
│                                  │
│ [Revoir le trajet]               │
│ [Sauvegarder]                    │
│ [Supprimer]                      │
└──────────────────────────────────┘
```

### 12.2 Journey Review Screen

- [ ] Timeline view of all detected steps
- [ ] Edit each step:
  - Change type (waiting → break)
  - Adjust times
  - Add/remove spots
  - Add notes
- [ ] Correct spot information (if auto-detected incorrectly)
- [ ] Add photos to steps
- [ ] Rate overall journey

### 12.3 Data Corrections

```typescript
interface JourneyCorrection {
  stepId: TravelStepId;
  originalType: StepType;
  correctedType: StepType;
  originalSpot?: Spot;
  correctedSpot?: Spot;
  notes?: string;
}
```

### 12.4 Journey Statistics

After saving, show:
- Total distance
- Total time
- Time waiting vs. traveling
- Average ride length
- Spots used (with option to rate)

---

## Implementation Priority

| Priority | Feature | Effort | Impact | Dependencies |
|----------|---------|--------|--------|--------------|
| 🔴 High | F11: Navigation | High | Critical | Location tracking |
| 🔴 High | F12: Save Journey | Medium | High | F11 |
| 🔴 High | F8: User Profile | Medium | High | Auth |
| 🟠 Medium | F1: Spot Pictures | Medium | High | Storage |
| 🟠 Medium | F2: Rest Areas | Low | High | Data import |
| 🟠 Medium | F6: External Sharing | Medium | High | Backend |
| 🟠 Medium | F7: Objectif | Low | Medium | UI only |
| 🟡 Lower | F3: Double Itinerary | High | Medium | Routing API |
| 🟡 Lower | F4: Longway | Medium | Medium | F3 |
| 🟡 Lower | F5: Group Tracking | High | Medium | Realtime sync |
| 🟡 Lower | F9: Community | High | Medium | Backend, moderation |
| 🟡 Lower | F10: Badges | Medium | Low | F8, tracking |

---

## Technical Dependencies

### External Services Needed

| Service | Features | Estimated Cost |
|---------|----------|----------------|
| Google Street View API | F1 | ~$7/1000 requests |
| Routing API (Mapbox/ORS) | F3, F4 | Free tier available |
| Firebase/Supabase Realtime | F5, F6 | Free tier for MVP |
| Image Storage (S3/Cloudflare) | F1, F9 | ~$5/month |
| Push Notifications (Expo) | F5, F9, F10 | Free |

### Database Schema Additions

```sql
-- Feature 1: Pictures
CREATE TABLE spot_pictures (...);

-- Feature 2: Rest Areas
CREATE TABLE rest_areas (...);

-- Feature 5 & 6: Tracking
CREATE TABLE travel_groups (...);
CREATE TABLE group_members (...);
CREATE TABLE tracking_links (...);

-- Feature 8: Profile
CREATE TABLE user_profiles (...);
CREATE TABLE travels (...);
CREATE TABLE travel_steps (...);

-- Feature 9: Community
CREATE TABLE posts (...);
CREATE TABLE comments (...);
CREATE TABLE post_likes (...);

-- Feature 10: Badges
CREATE TABLE badges (...);
CREATE TABLE user_badges (...);
```

---

## Implementation Checklist

### Feature 1: Spot Pictures
- [ ] Database schema for pictures
- [ ] Street View service integration
- [ ] Image upload with expo-image-picker
- [ ] SpotGallery component
- [ ] Photo viewer modal

### Feature 2: Highway Rest Areas
- [ ] OSM data import script
- [ ] Rest area database table
- [ ] RestArea marker component
- [ ] Rest area → spot conversion

### Feature 3: Double Itinerary
- [ ] Routing API integration
- [ ] Path intersection algorithm
- [ ] DoubleRouteSheet component
- [ ] Map overlay for dual routes

### Feature 4: Longway
- [ ] Detour calculation service
- [ ] Longway suggestions UI
- [ ] Config for max detour times

### Feature 5: Group Tracking
- [ ] Group data model & API
- [ ] Real-time location sync
- [ ] Group map view
- [ ] Invite/join flow

### Feature 6: External Sharing
- [ ] Tracking link generation
- [ ] Web viewer page
- [ ] Link management UI
- [ ] Security measures

### Feature 7: Objectif
- [ ] Destination themes data
- [ ] Suggestion algorithm
- [ ] Objectif popup component
- [ ] Trigger logic (time at spot)

### Feature 8: User Profile
- [ ] Profile data model
- [ ] Profile screen
- [ ] Stats calculation
- [ ] Travel history list

### Feature 9: Community
- [ ] Post/comment data model
- [ ] Community screens
- [ ] Post creation flow
- [ ] Moderation system

### Feature 10: Badges
- [ ] Badge definitions
- [ ] Progress tracking
- [ ] Unlock notifications
- [ ] Badge display components

### Feature 11: Navigation
- [ ] Background location service
- [ ] Journey detection algorithm
- [ ] Navigation UI components
- [ ] Vehicle change detection

### Feature 12: Save Journey
- [ ] Journey review screen
- [ ] Step editing UI
- [ ] Correction handling
- [ ] Statistics display

---

## Resources

- [Expo Location (Background)](https://docs.expo.dev/versions/latest/sdk/location/)
- [Google Street View API](https://developers.google.com/maps/documentation/streetview)
- [OpenRouteService](https://openrouteservice.org/dev/#/api-docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

---

## Prioritized Implementation Checklist

### Phase 1: 🔴 Critical Foundation (F11, F12, F8)

#### F11: Journey Recording & Navigation
- [ ] Create `src/navigation/` feature module
- [ ] Implement background location tracking service
- [ ] Create journey state detection algorithm (waiting/in_vehicle/break)
- [ ] Build `NavigationBar` component
- [ ] Build `JourneyTimeline` component
- [ ] Build `NavigationSheet` component
- [ ] Implement vehicle change detection
- [ ] Add `VehicleChangePrompt` component
- [ ] Test battery-efficient location tracking

#### F12: Save Journey Feature
- [ ] Create journey review screen
- [ ] Implement step editing UI
- [ ] Add correction handling logic
- [ ] Build statistics display component
- [ ] Implement journey save to database
- [ ] Add photo attachment to journey steps
- [ ] Add spot rating after journey completion

#### F8: User Profile & Travel History
- [ ] Create `src/user/` feature module
- [ ] Define UserProfile, UserStats, Travel data models
- [ ] Create user_profiles database table
- [ ] Create travels database table
- [ ] Create travel_steps database table
- [ ] Build profile screen UI
- [ ] Implement stats calculation service
- [ ] Build travel history list component
- [ ] Add manual travel logging feature
- [ ] Integrate with F11 for automatic journey tracking

---

### Phase 2: 🟠 High-Value Features (F1, F2, F6, F7)

#### F1: Spot Pictures
- [ ] Add SpotPicture types to `src/spot/types.ts`
- [ ] Create spot_pictures database table
- [ ] Create `src/spot/services/streetViewService.ts`
- [ ] Implement Google Street View API integration
- [ ] Install expo-image-picker
- [ ] Create `SpotPhotoUploader` component
- [ ] Create `src/spot/services/imageUploadService.ts`
- [ ] Implement image compression
- [ ] Create `SpotGallery` component
- [ ] Create photo viewer modal with zoom/pan
- [ ] Add photo badges (Street View vs User Photo)
- [ ] Integrate into SpotDetailsSheet
- [ ] Add photo moderation queue

#### F2: Highway Rest Areas Database
- [ ] Create `src/restArea/` feature module
- [ ] Define RestArea and Facility types
- [ ] Create rest_areas database table
- [ ] Create OSM data import script `scripts/import-rest-areas.ts`
- [ ] Import ~400 French rest areas
- [ ] Bundle rest area data as static JSON
- [ ] Create RestArea marker component
- [ ] Add rest area → spot conversion feature
- [ ] Implement automatic spot-to-rest-area linking
- [ ] Add OTA update mechanism for rest area data

#### F6: External Location Sharing
- [ ] Create `src/sharing/` feature module
- [ ] Define TrackingLink data model
- [ ] Create tracking_links database table
- [ ] Implement secure link generation
- [ ] Build web viewer page (no app required)
- [ ] Add configurable expiration (1h/6h/24h)
- [ ] Implement link revocation
- [ ] Add rate limiting
- [ ] Add optional PIN protection
- [ ] Build "Share my location" UI
- [ ] Add active shares list with revoke option
- [ ] Add viewer count indicator

#### F7: Dynamic Destination Suggestions (Objectif)
- [ ] Create `src/destination/` feature module
- [ ] Define DestinationTheme data model
- [ ] Create ~30 French destination themes data
- [ ] Implement suggestion algorithm
- [ ] Create trigger logic (time at spot detection)
- [ ] Build Objectif popup component
- [ ] Add theme copy/use functionality
- [ ] Add dismissible preference storage
- [ ] Add enable/disable settings option

---

### Phase 3: 🟡 Advanced Features (F3, F4, F5, F9, F10)

#### F3: Double Itinerary Calculator
- [ ] Create `src/routing/` feature module
- [ ] Integrate routing API (Mapbox/OpenRouteService)
- [ ] Implement path intersection algorithm
- [ ] Create `calculateDoubleRoute` service
- [ ] Find optimal drop-off point logic
- [ ] Build `DoubleRouteSheet` component
- [ ] Implement dual-route map overlay
- [ ] Add common path highlighting
- [ ] Display detour time calculation

#### F4: Longway - Extended Drop-off Suggestions
- [ ] Define LONGWAY_CONFIG constants
- [ ] Implement `findLongwayOptions()` service
- [ ] Calculate actual detour times (not straight-line)
- [ ] Implement spot ranking algorithm
- [ ] Build Longway suggestions UI
- [ ] Add Longway toggle in route planning
- [ ] Create suggestion chips component
- [ ] Add driver benefit explanation

#### F5: Group Tracking
- [ ] Create `src/group/` feature module
- [ ] Define TravelGroup and GroupMember types
- [ ] Create travel_groups database table
- [ ] Create group_members database table
- [ ] Implement real-time location sync (Firebase/Supabase)
- [ ] Add background location updates
- [ ] Build group map view
- [ ] Implement create/join group flow
- [ ] Add invite code system
- [ ] Build group chat feature
- [ ] Implement pause/resume location sharing
- [ ] Add auto-status detection
- [ ] Implement group expiration logic
- [ ] Add privacy controls

#### F9: Community Section
- [ ] Create `src/community/` feature module
- [ ] Define Post, Comment data models
- [ ] Create posts database table
- [ ] Create comments database table
- [ ] Create post_likes database table
- [ ] Build community navigation structure
- [ ] Create post browsing/search UI
- [ ] Implement post creation with markdown
- [ ] Build comment and like system
- [ ] Implement report system
- [ ] Create moderation queue
- [ ] Add push notifications for replies
- [ ] Define community guidelines
- [ ] Implement moderator roles
- [ ] Add auto-flag suspicious content
- [ ] Implement ban system

#### F10: User Badges & Gamification
- [ ] Create `src/badges/` feature module
- [ ] Define Badge data model
- [ ] Create badges database table
- [ ] Create user_badges database table
- [ ] Define ~20 badge types with requirements
- [ ] Implement badge progress tracking
- [ ] Build unlock notification with animation
- [ ] Create badge display components
- [ ] Add badges to profile screen
- [ ] Implement optional leaderboards (opt-in)

---

## Implementation Timeline Estimate

**Phase 1** (Critical Foundation): 6-8 weeks
- F11: 3 weeks
- F12: 1.5 weeks
- F8: 2 weeks

**Phase 2** (High-Value Features): 5-6 weeks
- F1: 2 weeks
- F2: 1 week
- F6: 1.5 weeks
- F7: 0.5 week

**Phase 3** (Advanced Features): 10-12 weeks
- F3: 2 weeks
- F4: 1 week
- F5: 3 weeks
- F9: 4 weeks
- F10: 1.5 weeks

**Total**: 21-26 weeks (~5-6 months) for complete feature set
