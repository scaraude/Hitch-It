# Feature: Navigation & Journey Integration

## 📋 Overview

Transform the existing map search feature into a full navigation experience that integrates with the journey recording system. When a user searches for a destination, they can start a guided navigation that automatically begins a journey recording and displays the optimal hitchhiking route with relevant spots.

**Status**: 🟡 In Progress (Implementation complete, testing pending)
**Priority**: High (Foundation for hitchhiking experience)
**Complexity**: High
**Dependencies**:
- ✅ Map Search (FEATURE_MAP_SEARCH_NAVIGATION)
- ✅ Journey Recording (F11 in FEATURES_IMPLEMENTATION_PLAN)

---

## 🎯 User Story

> **As a hitchhiker**, I want to search for my destination, see a hitchhiking route with relevant spots, and have my journey automatically recorded so I can focus on getting rides without manual tracking.

**Flow**:
1. User searches for "Bayonne" using existing search
2. Temporary marker appears at destination + full-width "Embarquer" button at bottom
3. User taps button → Route appears (blue path, only spots on route visible)
4. Journey recording starts automatically in background
5. User hitchhikes, journey tracks their progress
6. On arrival → Journey stops, completion sheet appears
7. On manual stop mid-journey → Journey cached 10min, then auto-saved to profile
8. User can save journey and link discovered spots (when F12 ready)

---

## 🎨 UX/UI Specification

### Visual States

#### 1. Search Result State (New)
```
Map View:
┌─────────────────────────────────────┐
│ [🔍] 1 cours gambetta, Lyon     [X] │ ← Search bar (shows exact search)
│                                     │
│           🗺️ Map                   │
│                                     │
│  📍 1 cours gambetta, Lyon         │ ← Marker shows searched place name
│                                     │
│                                     │
│ ┌─────────────────────────────────┐│
│ │   🧭 Embarquer                  ││ ← Full-width button at bottom
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Button Details**:
- Text: "🧭 Embarquer" (or "C'est parti !" / "En route")
- Position: Bottom of screen, full-width minus margins
- Style: Primary button (COLORS.primary background)

**Marker Name Logic** (Keep it simple):
- Shows the exact search query as marker name
- Example: "Lyon" → Marker name: "Lyon"
- Example: "1 cours gambetta, Lyon" → Marker name: "1 cours gambetta, Lyon"
- No processing needed, just display `searchQuery` directly

#### 2. Navigation Active State
```
┌─────────────────────────────────────┐
│ 🧭 Vers Bayonne              [Stop] │ ← Navigation header
│ ───────────────────────────────────│
│           🗺️ Map                   │
│                                     │
│    📍 You                           │ ← User location (blue)
│     ····· Light blue path ·····    │ ← Route line
│         ⭕ Spot 1                   │ ← ONLY spots on route visible
│         ⭕ Spot 2                   │ ← Regular spot markers (no special styling)
│                🎯 Bayonne           │ ← Destination (green)
│                                     │
│ ┌─────────────────────────────┐   │
│ │ 🔴 Recording  02:45  2 stops│   │ ← Journey indicator (existing)
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**IMPORTANT - Spot Visibility**:
- ✅ ONLY show spots that are on the route (within 500m)
- ✅ All other spots disappear from map
- ✅ Keep it simple: just filter spots before rendering
- ✅ Spots use existing marker style (no highlighting/size changes)

#### 3. Arrival / Stop Detection
```
┌─────────────────────────────────────┐
│   Navigation terminée ! 🎉          │
│                                     │
│   Bordeaux → Bayonne               │
│   3h45 | 185 km                    │
│                                     │
│   Voulez-vous sauvegarder ce       │
│   voyage et enregistrer les        │
│   spots découverts ?               │
│                                     │
│   [Oui, sauvegarder]  [Non merci]  │
└─────────────────────────────────────┘
```

---

## 🏗️ Technical Architecture

### Module Structure

```
src/
├── navigation/                    # NEW FEATURE MODULE
│   ├── components/
│   │   ├── NavigationHeader.tsx         # Top bar: "🧭 Vers Bayonne [Stop]"
│   │   ├── DestinationMarker.tsx        # Simple marker (search query as name)
│   │   ├── StartNavigationButton.tsx    # Full-width button at bottom
│   │   ├── RoutePolyline.tsx            # Light blue route path
│   │   └── NavigationCompleteSheet.tsx  # Bottom sheet after arrival
│   ├── services/
│   │   ├── routingService.ts         # Calculate route (Mapbox/OpenRouteService)
│   │   └── routeSpotMatcher.ts       # Find spots along route
│   ├── context/
│   │   └── NavigationContext.tsx     # Navigation state management
│   ├── hooks/
│   │   ├── useNavigation.ts          # Access navigation context
│   │   └── useArrivalDetection.ts    # Detect when user arrives
│   ├── types.ts
│   └── index.ts
├── components/
│   └── MapSearchBar.tsx              # MODIFY: Add onDestinationSelected
├── journey/                          # EXISTING (integrate with)
│   └── context/JourneyContext.tsx
└── screens/
    └── HomeScreen.tsx                # MODIFY: Integrate navigation
```

---

## 🔧 Technical Implementation Tickets

### Ticket 1: Routing Service Integration

**File**: `src/navigation/services/routingService.ts`

**Goal**: Calculate optimal route between two points using a routing API.

**API Choice**: **OpenRouteService** (Free tier: 2000 requests/day)
- Alternative: Mapbox Directions (500K requests/month free)
- Fallback: Photon doesn't do routing, only geocoding

**Implementation**:
```typescript
// src/navigation/types.ts
export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface NavigationRoute {
  id: RouteId;
  origin: RoutePoint;
  destination: RoutePoint;
  destinationName: string;
  polyline: RoutePoint[];        // Array of coordinates for path
  distanceKm: number;
  durationMinutes: number;
  createdAt: Date;
}

// src/navigation/services/routingService.ts
const ORS_API_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';
const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY; // Add to .env

export async function calculateRoute(
  origin: RoutePoint,
  destination: RoutePoint,
  destinationName: string
): Promise<NavigationRoute> {
  // POST to OpenRouteService with coordinates
  // Parse GeoJSON response
  // Extract polyline points
  // Calculate distance and duration
  // Return NavigationRoute
  // Handle errors: network failure, API limits, invalid coords
}
```

**Error Handling**:
- API rate limit → Show toast: "Trop de requêtes, réessayez dans 1 minute"
- Network error → Show toast: "Impossible de calculer l'itinéraire (hors ligne ?)"
- Invalid coordinates → Log error, return null

**Testing**:
- [ ] Test with Bordeaux → Bayonne
- [ ] Test with very close points (<1km)
- [ ] Test with very far points (>1000km)
- [ ] Test error handling (offline mode)

**Dependencies**:
- Need OpenRouteService API key (free signup)
- Add `EXPO_PUBLIC_ORS_API_KEY` to `.env`

**Acceptance Criteria**:
- ✅ Returns valid route with polyline coordinates
- ✅ Distance and duration are reasonable
- ✅ Handles errors gracefully (no crashes)
- ✅ No `any` types
- ✅ Uses logger for errors

---

### Ticket 2: Route-Spot Matching Service

**File**: `src/navigation/services/routeSpotMatcher.ts`

**Goal**: Find all spots within X meters of the calculated route.

**Algorithm**:
```typescript
// src/navigation/types.ts
export interface SpotOnRoute {
  spot: Spot;
  distanceFromRouteMeters: number;
  closestRoutePointIndex: number;  // Which route point it's near
}

// src/navigation/services/routeSpotMatcher.ts
const MAX_DISTANCE_FROM_ROUTE_METERS = 500; // 500m buffer

export function findSpotsAlongRoute(
  route: NavigationRoute,
  allSpots: Spot[]
): SpotOnRoute[] {
  // For each spot:
  //   1. Calculate distance to route (point-to-polyline)
  //   2. If distance < MAX_DISTANCE_FROM_ROUTE_METERS, include it
  //   3. Sort by route progression (start → end)
  // Return sorted array
}

// Helper: Calculate perpendicular distance from point to line segment
function distanceToLineSegment(
  point: RoutePoint,
  lineStart: RoutePoint,
  lineEnd: RoutePoint
): number {
  // Haversine formula for geographic distance
  // Return distance in meters
}
```

**Optimization**:
- Don't check every route point (too slow for long routes)
- Sample route points every ~1km
- Use bounding box pre-filter to reduce spot candidates

**Testing**:
- [ ] Spot exactly on route → distance ≈ 0
- [ ] Spot 200m from route → included
- [ ] Spot 1000m from route → excluded
- [ ] Route with no nearby spots → empty array
- [ ] Performance with 100+ spots

**Acceptance Criteria**:
- ✅ Finds spots within 500m of route
- ✅ Spots are sorted by route progression
- ✅ Fast (<100ms for 100 spots, 100km route)
- ✅ No false positives (spots far from route)

---

### Ticket 3: Navigation Context & State Management

**File**: `src/navigation/context/NavigationContext.tsx`

**Goal**: Manage navigation state (route, active/inactive, destination).

**State**:
```typescript
// src/navigation/types.ts
export interface NavigationState {
  isActive: boolean;
  route: NavigationRoute | null;
  spotsOnRoute: SpotOnRoute[];
  destinationMarker: DestinationMarker | null;  // Before navigation starts
}

export interface DestinationMarker {
  location: RoutePoint;
  name: string;
}

// src/navigation/context/NavigationContext.tsx
interface NavigationContextValue {
  // State
  navigation: NavigationState;

  // Actions
  setDestination: (location: RoutePoint, name: string) => void;
  startNavigation: (userLocation: RoutePoint) => Promise<void>;
  stopNavigation: () => void;
  clearDestination: () => void;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [navigation, setNavigation] = useState<NavigationState>(INITIAL_STATE);
  const { startRecording } = useJourney();  // Integrate with journey

  const startNavigation = async (userLocation: RoutePoint) => {
    // 1. Calculate route
    const route = await calculateRoute(userLocation, destination, destinationName);

    // 2. Find spots along route
    const spotsOnRoute = findSpotsAlongRoute(route, allSpots);

    // 3. Update state
    setNavigation({
      isActive: true,
      route,
      spotsOnRoute,
      destinationMarker: null,  // Clear temporary marker
    });

    // 4. Start journey recording
    await startRecording();

    logger.info(`Navigation started to ${destinationName}`);
  };

  const stopNavigation = () => {
    setNavigation(INITIAL_STATE);
    logger.info('Navigation stopped');
  };

  // ... other actions
}
```

**Integration Points**:
- ✅ Calls `JourneyContext.startRecording()` when navigation starts
- ✅ Journey management on stop:
  - **If arrived at destination**: Stop journey recording immediately
  - **If stopped mid-journey**: Keep journey cached for 10 minutes
    - If user starts navigation to same destination within 10min → Resume journey
    - After 10min → Save journey automatically (available in user profile when ready)
- ✅ Provides route data to map components

**Acceptance Criteria**:
- ✅ `startNavigation()` calculates route and starts journey
- ✅ `stopNavigation()` clears state
- ✅ No memory leaks (cleanup on unmount)
- ✅ TypeScript types are strict (no `any`)

---

### Ticket 4: Destination Marker Component

**File**: `src/navigation/components/DestinationMarker.tsx` (Simple marker, no callout)

**Goal**: Show simple marker at searched location. Button is separate, at bottom of screen.

**UI**:
```typescript
interface DestinationMarkerProps {
  location: RoutePoint;
  name: string;  // Exact search query (e.g., "Lyon" or "1 cours gambetta, Lyon")
}

export function DestinationMarker({ location, name }: DestinationMarkerProps) {
  return (
    <Marker
      coordinate={location}
      title={name}  // Shows search query as-is
      pinColor="green"
    />
  );
}
```

**Keep it simple**:
- Just a standard marker with the search query as title
- No custom callout or button (button is separate component)
- Use default green pin color for destination
- Name = exact search query (no processing)

**Behavior**:
- Appears when user selects a search result
- Disappears when navigation starts (replaced by route + destination marker)

**Acceptance Criteria**:
- ✅ Marker appears at correct coordinates
- ✅ Marker title shows exact search query
- ✅ Marker disappears after navigation starts
- ✅ Simple implementation (no custom views)

---

### Ticket 4.5: Start Navigation Button

**File**: `src/navigation/components/StartNavigationButton.tsx`

**Goal**: Full-width button at bottom of screen to start navigation.

**UI**:
```typescript
interface StartNavigationButtonProps {
  destinationName: string;
  onPress: () => void;
}

export function StartNavigationButton({ destinationName, onPress }: StartNavigationButtonProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.text}>🧭 Embarquer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
```

**Positioning**:
- Position: Absolute, bottom of screen
- Margins: 16px left/right
- Bottom: 20px from screen edge
- Z-index: 100 (above map, below search bar)

**Behavior**:
- Only visible when `navigation.destinationMarker !== null`
- Disappears when navigation starts
- Triggers `startNavigation()` on press

**Acceptance Criteria**:
- ✅ Full-width minus margins (32px total horizontal padding)
- ✅ Positioned at bottom of screen
- ✅ Uses COLORS.primary background
- ✅ Visible above map but below other UI
- ✅ Smooth press animation

---

### Ticket 5: Route Polyline Rendering

**File**: `src/navigation/components/RoutePolyline.tsx`

**Goal**: Draw light blue path from user location to destination.

**Implementation**:
```typescript
import { Polyline } from 'react-native-maps';

interface RoutePolylineProps {
  route: NavigationRoute;
}

const ROUTE_COLOR = '#4A90E2';  // Light blue (Google Maps style)
const ROUTE_WIDTH = 4;

export function RoutePolyline({ route }: RoutePolylineProps) {
  return (
    <Polyline
      coordinates={route.polyline}
      strokeColor={ROUTE_COLOR}
      strokeWidth={ROUTE_WIDTH}
      lineCap="round"
      lineJoin="round"
    />
  );
}
```

**Visual Requirements**:
- Light blue color (not too bright, not too dark)
- Visible above map but below markers
- Smooth curves (use `lineCap="round"`)

**Acceptance Criteria**:
- ✅ Path follows route accurately
- ✅ Color is distinguishable from map
- ✅ Doesn't obscure important markers
- ✅ Renders smoothly (no lag)

---

### Ticket 6: Spot Filtering (Keep it Simple)

**File**: No new component needed - modify HomeScreen spot rendering

**Goal**: Only show spots on route during navigation. Hide all others.

**Implementation** (in HomeScreen):
```typescript
// Simple filtering logic
const visibleSpots = navigation.isActive
  ? spots.filter(spot =>
      navigation.spotsOnRoute.some(s => s.spot.id === spot.id)
    )
  : spots;

// Render spots (same marker style as always)
{visibleSpots.map(spot => (
  <SpotMarker key={spot.id} spot={spot} />  // Existing component, no changes
))}
```

**Keep it simple**:
- ✅ During navigation: Filter spots to only show those on route
- ✅ Outside navigation: Show all spots
- ✅ Use existing `SpotMarker` component (no styling changes)
- ✅ No highlighting, no size changes, no color changes
- ✅ Just simple filtering before rendering

**Acceptance Criteria**:
- ✅ Only on-route spots visible during navigation
- ✅ All spots visible when not navigating
- ✅ Spots use existing marker component (no new code)
- ✅ Tapping spot still shows details sheet
- ✅ Minimal code changes (just filtering)

---

### Ticket 7: Navigation Header Component

**File**: `src/navigation/components/NavigationHeader.tsx`

**Goal**: Top bar showing destination and stop button during navigation.

**UI**:
```typescript
interface NavigationHeaderProps {
  destinationName: string;
  distanceRemainingKm: number;
  onStop: () => void;
}

export function NavigationHeader({ destinationName, distanceRemainingKm, onStop }: NavigationHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <Text style={styles.icon}>🧭</Text>
        <Text style={styles.destination}>Vers {destinationName}</Text>
        <Text style={styles.distance}>({distanceRemainingKm} km)</Text>
      </View>
      <Pressable style={styles.stopButton} onPress={onStop}>
        <Text style={styles.stopText}>Stop</Text>
      </Pressable>
    </View>
  );
}
```

**Behavior**:
- Shows only when `navigation.isActive === true`
- Positioned at top of screen (above search bar)
- Stop button → calls `stopNavigation()` + asks for confirmation

**Styling**:
- Background: Semi-transparent white with shadow
- Use `COLORS.primary` for text
- Stop button: Red text, destructive style

**Acceptance Criteria**:
- ✅ Appears when navigation starts
- ✅ Shows correct destination name
- ✅ Stop button stops navigation
- ✅ Doesn't overlap with search bar

---

### Ticket 8: Arrival Detection Hook

**File**: `src/navigation/hooks/useArrivalDetection.ts`

**Goal**: Detect when user arrives at destination or stops navigation prematurely.

**Algorithm**:
```typescript
export function useArrivalDetection(
  route: NavigationRoute | null,
  userLocation: Location | null
): {
  hasArrived: boolean;
  distanceToDestinationMeters: number;
} {
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    if (!route || !userLocation) return;

    const distance = calculateDistance(
      userLocation,
      route.destination
    );

    // Arrived if within 200m of destination
    if (distance < 200) {
      setHasArrived(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [userLocation, route]);

  return { hasArrived, distanceToDestination };
}
```

**Arrival Criteria**:
- User is within **200 meters** of destination
- OR user manually stops navigation (button press)

**Behavior on Arrival**:
1. Trigger haptic feedback (success vibration)
2. Stop journey recording
3. Show `NavigationCompleteSheet`

**Edge Cases**:
- User stops navigation mid-journey → Ask "Journey incomplete, save anyway?"
- GPS inaccurate (>100m error) → Don't falsely trigger arrival
- User passes destination → Still detect arrival

**Acceptance Criteria**:
- ✅ Detects arrival within 200m
- ✅ Triggers completion flow
- ✅ No false positives from GPS jitter

---

### Ticket 9: Navigation Complete Sheet

**File**: `src/navigation/components/NavigationCompleteSheet.tsx`

**Goal**: Bottom sheet asking user to save journey and register spots.

**UI**:
```typescript
interface NavigationCompleteSheetProps {
  journey: Journey;
  spotsDiscovered: SpotOnRoute[];
  onSave: () => void;
  onDiscard: () => void;
}

export function NavigationCompleteSheet({
  journey,
  spotsDiscovered,
  onSave,
  onDiscard
}: NavigationCompleteSheetProps) {
  return (
    <BottomSheet visible={true} onClose={onDiscard}>
      <View style={styles.content}>
        <Text style={styles.title}>Navigation terminée ! 🎉</Text>

        <View style={styles.stats}>
          <Text>{journey.origin} → {journey.destination}</Text>
          <Text>{formatDuration(journey.duration)} | {journey.distanceKm} km</Text>
        </View>

        <Text style={styles.question}>
          Voulez-vous sauvegarder ce voyage et enregistrer les spots découverts ?
        </Text>

        <Text style={styles.spotsInfo}>
          {spotsDiscovered.length} spots utilisés
        </Text>

        <View style={styles.buttons}>
          <Button onPress={onSave} style={styles.primaryButton}>
            Oui, sauvegarder
          </Button>
          <Button onPress={onDiscard} style={styles.secondaryButton}>
            Non merci
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}
```

**Behavior**:
- Appears automatically on arrival detection
- "Oui, sauvegarder" → Saves journey + links spots → Navigate to journey review (F12)
- "Non merci" → Discards journey → Returns to normal map view

**Journey Validity Check**:
```typescript
function isJourneyValid(journey: Journey): boolean {
  // Valid if:
  // - Duration > 5 minutes
  // - Distance > 1 km
  // - At least 1 recorded point
  return (
    journey.durationMinutes >= 5 &&
    journey.distanceKm >= 1 &&
    journey.points.length > 0
  );
}
```

**Acceptance Criteria**:
- ✅ Shows journey stats (duration, distance)
- ✅ Shows spots discovered count
- ✅ Save button works (integrates with F12)
- ✅ Discard button clears navigation state
- ✅ Only appears for valid journeys

---

### Ticket 10: HomeScreen Integration

**File**: `src/screens/HomeScreen.tsx`

**Goal**: Wire up all navigation components and orchestrate the flow.

**Changes**:
```typescript
export function HomeScreen() {
  const mapViewRef = useRef<MapViewRef>(null);
  const { navigation, setDestination, startNavigation, stopNavigation } = useNavigation();
  const { userLocation } = useLocation();
  const { hasArrived } = useArrivalDetection(navigation.route, userLocation);

  // Handle search result selection
  const handleLocationSelected = (location: Location, name: string) => {
    // Set destination marker (doesn't start navigation yet)
    setDestination(location, name);

    // Animate map to show destination
    mapViewRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
  };

  // Handle "Embarquer" button press
  const handleStartNavigation = async () => {
    if (!userLocation) {
      Toast.show({ text: 'Impossible de démarrer (position inconnue)' });
      return;
    }

    await startNavigation(userLocation);
  };

  // Handle arrival
  useEffect(() => {
    if (hasArrived && navigation.isActive) {
      // Show completion sheet
      setShowCompletionSheet(true);
    }
  }, [hasArrived]);

  return (
    <View style={styles.container}>
      {/* Navigation header (only when active) */}
      {navigation.isActive && (
        <NavigationHeader
          destinationName={navigation.route.destinationName}
          onStop={stopNavigation}
        />
      )}

      {/* Search bar */}
      <MapSearchBar onLocationSelected={handleLocationSelected} />

      {/* Map */}
      <MapView ref={mapViewRef}>
        {/* Destination marker (before navigation) */}
        {navigation.destinationMarker && (
          <DestinationMarker
            location={navigation.destinationMarker.location}
            name={navigation.destinationMarker.name}
            onStartNavigation={handleStartNavigation}
            onCancel={() => setDestination(null, '')}
          />
        )}

        {/* Route polyline (during navigation) */}
        {navigation.route && (
          <RoutePolyline route={navigation.route} />
        )}

        {/* Spots (highlighted if on route) */}
        {spots.map(spot => (
          <SpotOnRouteMarker
            key={spot.id}
            spot={spot}
            isOnRoute={navigation.spotsOnRoute.some(s => s.spot.id === spot.id)}
          />
        ))}

        {/* User location marker */}
        {userLocation && <UserLocationMarker location={userLocation} />}
      </MapView>

      {/* Journey indicator (existing) */}
      <ActiveJourneyIndicator />

      {/* Navigation complete sheet */}
      {showCompletionSheet && (
        <NavigationCompleteSheet
          journey={currentJourney}
          spotsDiscovered={navigation.spotsOnRoute}
          onSave={handleSaveJourney}
          onDiscard={handleDiscardJourney}
        />
      )}
    </View>
  );
}
```

**Z-Index Layering** (top → bottom):
1. NavigationHeader (z: 2000)
2. MapSearchBar (z: 1000)
3. NavigationCompleteSheet (z: 900)
4. ActiveJourneyIndicator (z: 500)
5. MapView (z: 0)

**Acceptance Criteria**:
- ✅ Search → Destination marker → Start navigation → Route appears
- ✅ Journey recording starts automatically
- ✅ Arrival detection triggers completion sheet
- ✅ No UI overlaps or z-index conflicts
- ✅ All state transitions work smoothly

---

### Ticket 11: Environment Setup & API Keys

**File**: `.env`, `.env.example`

**Goal**: Add OpenRouteService API key for routing.

**Steps**:
1. Sign up at https://openrouteservice.org/dev/#/signup
2. Get free API key (2000 requests/day)
3. Add to `.env`:
   ```env
   EXPO_PUBLIC_ORS_API_KEY=your_key_here
   ```
4. Update `.env.example`:
   ```env
   EXPO_PUBLIC_ORS_API_KEY=
   ```
5. Update [AGENTS.md](AGENTS.md) with API setup instructions

**Rate Limits**:
- Free tier: 2000 requests/day
- 40 requests/minute
- Sufficient for MVP (each navigation = 1 request)

**Fallback**:
- If rate limit hit → Show toast: "Limite atteinte, réessayez plus tard"
- Don't crash app

**Acceptance Criteria**:
- ✅ API key stored securely in .env
- ✅ Not committed to git (.env in .gitignore)
- ✅ Documentation updated

---

### Ticket 12: Testing & Polish

**Manual Testing Checklist**:

**Navigation Flow**:
- [ ] Search "Bayonne" → Marker appears at Bayonne
- [ ] Tap "Embarquer" → Route appears, journey starts
- [ ] Route is visible (light blue path)
- [ ] Spots on route are highlighted
- [ ] Navigation header shows "Vers Bayonne"
- [ ] Journey indicator shows recording status

**Arrival Detection**:
- [ ] Mock GPS location near destination (Xcode/Android Studio)
- [ ] Arrival triggers when <200m from destination
- [ ] Haptic feedback on arrival
- [ ] Completion sheet appears

**Edge Cases**:
- [ ] Stop navigation mid-journey → Journey saves as "incomplete"
- [ ] Network offline → Routing fails gracefully with toast
- [ ] API rate limit → Shows error toast
- [ ] Invalid destination → Handles error
- [ ] Very long route (>500km) → Renders without lag

**Code Quality**:
- [ ] `pnpm lint` passes (Biome)
- [ ] `npx tsc --noEmit` passes (TypeScript)
- [ ] No `any` types
- [ ] No `console.log` (only logger)
- [ ] No unused imports/variables

**Performance**:
- [ ] Route calculation <2s
- [ ] Spot matching <100ms
- [ ] Map rendering smooth (60 FPS)
- [ ] No memory leaks (test 10 navigations)

**Acceptance Criteria**:
- ✅ All manual tests pass
- ✅ Code quality checks pass
- ✅ No performance issues
- ✅ User experience is smooth and intuitive

---

## 📦 Dependencies

### New Dependencies
- **None** (OpenRouteService uses `fetch`, already available)

### Environment Variables
- `EXPO_PUBLIC_ORS_API_KEY` - OpenRouteService API key (free)

### External Services
- **OpenRouteService** - Route calculation (Free: 2000 req/day)
  - Docs: https://openrouteservice.org/dev/#/api-docs/v2/directions

---

## 🚀 Implementation Phases

### Phase 1: Routing Foundation (Tickets 1-3)
**Goal**: Calculate routes and manage navigation state

**Tasks**:
- [x] Ticket 1: Routing Service (ORS integration)
- [x] Ticket 2: Route-Spot Matcher
- [x] Ticket 3: Navigation Context
- [x] Ticket 11: Environment Setup

**Deliverable**: Can calculate route, no UI yet

---

### Phase 2: Core UI (Tickets 4-7)
**Goal**: Show destination marker, route, and navigation header

**Tasks**:
- [x] Ticket 4: Destination Marker
- [x] Ticket 4.5: Start Navigation Button
- [x] Ticket 5: Route Polyline
- [x] Ticket 6: Spots on Route Markers
- [x] Ticket 7: Navigation Header

**Deliverable**: Visual navigation experience working

---

### Phase 3: Journey Integration (Tickets 8-9)
**Goal**: Detect arrival and handle journey completion

**Tasks**:
- [x] Ticket 8: Arrival Detection Hook
- [x] Ticket 9: Navigation Complete Sheet

**Deliverable**: Full navigation → arrival → save flow

---

### Phase 4: Integration & Testing (Tickets 10, 12)
**Goal**: Wire everything together and polish

**Tasks**:
- [x] Ticket 10: HomeScreen Integration
- [ ] Ticket 12: Testing & Polish

**Deliverable**: Production-ready feature

---

## ⚠️ Known Limitations & Future Work

**Current Scope (MVP)**:
- ✅ Simple A→B routing
- ✅ Automatic journey recording
- ✅ Spot highlighting on route
- ✅ Arrival detection

**NOT in Scope** (for later):
- ❌ Turn-by-turn voice navigation
- ❌ Alternative routes
- ❌ Real-time traffic
- ❌ Offline routing
- ❌ Multi-stop routes (A→B→C)
- ❌ Route optimization (best spots)

**Future Enhancements** (F3, F4 in roadmap):
- Double Itinerary Calculator (F3)
- Longway suggestions (F4)

---

## 📚 References

- **OpenRouteService API**: https://openrouteservice.org/dev/#/api-docs/v2/directions
- **Mapbox Directions** (alternative): https://docs.mapbox.com/api/navigation/directions/
- **react-native-maps Polyline**: https://github.com/react-native-maps/react-native-maps/blob/master/docs/polyline.md
- **Haversine Formula**: https://en.wikipedia.org/wiki/Haversine_formula

---

## ✅ Acceptance Criteria (Full Feature)

- [ ] User can search for destination and see marker
- [ ] Tap "Embarquer" starts navigation
- [ ] Route appears as light blue path on map
- [ ] Spots on route are highlighted (orange/larger)
- [ ] Journey recording starts automatically
- [ ] Navigation header shows destination and distance
- [ ] Arrival detected within 200m of destination
- [ ] Haptic feedback on arrival
- [ ] Completion sheet offers to save journey
- [ ] Saving journey links stops to spots (F12 integration)
- [ ] Discarding journey clears navigation state
- [ ] All error cases handled gracefully (offline, API limits)
- [ ] Code follows "Less Is More" philosophy
- [ ] TypeScript with no `any` types
- [ ] Biome lint passes
- [ ] No performance issues (smooth animations, fast routing)

---

**Estimated Effort**: 2-3 weeks (1 developer)
- Phase 1: 3-4 days
- Phase 2: 4-5 days
- Phase 3: 2-3 days
- Phase 4: 2-3 days

**Dependencies**:
- ✅ Journey Recording (F11) - COMPLETE
- ⏳ Save Journey (F12) - NOT STARTED (needed for full flow)
