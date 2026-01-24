# Feature: Map Search & Navigation

## 📋 Overview

Add a Google Maps-inspired search functionality to enable users to search for locations and navigate the map to selected places.

**Status**: 🟡 In Progress (Phase 4/5 Complete)
**Priority**: Medium
**Complexity**: Medium

---

## 🎯 User Stories

1. **As a hitchhiker**, I want to search for a city/address so I can quickly navigate to spots in that area
2. **As a hitchhiker**, I want to see search suggestions as I type so I can find places faster
3. **As a hitchhiker**, I want to tap a suggestion to center the map on that location

---

## 🎨 UX/UI Specification

### Search Bar Component

**Position**: Top of the map (above MapView)
**Behavior**:
- Initially collapsed (search icon only)
- Expands when tapped to show text input
- Shows suggestions dropdown below when typing
- Collapses when search is dismissed or location selected

**Interaction Flow**:
```
1. User taps search icon → Input expands
2. User types "Par..." → Wait 800ms → Fetch suggestions
3. Shows dropdown: ["Paris", "Parempuyre", "Paray-le-Monial"]
4. User taps "Paris" → Map animates to Paris → Search collapses
```

**Visual Design** (follow app style):
- Use `COLORS.primary` (#096396) for active states
- Use `COLORS.background` (#F5F5F5) for input background
- Use existing shadow/border styles from other components

---

## 🏗️ Technical Architecture

### Component Structure

```
src/
├── components/
│   ├── MapView.tsx (existing - needs ref exposure)
│   └── MapSearchBar.tsx (NEW - search UI)
└── services/
    └── geocodingService.ts (NEW - place search API)
```

### Data Flow

```
User Input → Debounce (800ms) → Geocoding Service → Suggestions
                                                         ↓
User Selection → Extract Coordinates → MapView.animateToRegion()
```

---

## ⚠️ CRITICAL: Code Only What's Needed

**DO NOT implement anything beyond the current phase's requirements:**
- ❌ NO "future-proofing" or "what if" code
- ❌ NO unused interfaces or methods (like `reverseGeocode`)
- ❌ NO expansion mechanisms we don't need yet
- ❌ NO configuration for features we haven't built
- ✅ ONLY code what Phase 1-4 explicitly requires

**If it's not needed TODAY, don't write it.**

---

## 🔧 Implementation Details

### 1. Geocoding Service Selection

**Recommended: Photon API** ✅

| Criteria | Photon | Google Places | Mapbox |
|----------|--------|---------------|--------|
| **Cost** | FREE (open-source) | Paid after 1000/month | Paid after 100,000/month |
| **Worldwide** | ✅ Yes | ✅ Yes | ✅ Yes |
| **France Focus** | ✅ OpenStreetMap data | ✅ Excellent | ✅ Excellent |
| **No API Key** | ✅ Public instance | ❌ Requires key | ❌ Requires key |
| **Latency** | Good (hosted in EU) | Excellent | Excellent |
| **Easy Expansion** | ✅ Just change `lang` param | ✅ Just change `region` | ✅ Just change `country` |

**Why Photon?**
- Zero setup (no API keys, no billing)
- OpenStreetMap data = comprehensive French coverage
- Public instance: `https://photon.komoot.io`
- Easy to switch to self-hosted later if needed
- Simple REST API

**Fallback Plan**: If Photon proves insufficient, migrate to **Mapbox Geocoding API** (better rate limits than Google, easier pricing)

---

### 2. Geocoding Service Implementation

**File**: `src/services/geocodingService.ts`

```typescript
// Domain Types - ONLY what we need for search
export interface SearchSuggestion {
  id: string;                    // Unique identifier
  name: string;                  // Display name ("Paris, France")
  description: string;           // Secondary info ("Île-de-France")
  location: Location;            // { latitude, longitude }
}

// SIMPLE: Just one function, no interface abstraction needed yet
export async function searchPlaces(query: string): Promise<SearchSuggestion[]>

// Simple function - no class needed for one method
const PHOTON_URL = 'https://photon.komoot.io/api';

export async function searchPlaces(query: string): Promise<SearchSuggestion[]> {
  // GET /api?q={query}&lang=fr&limit=5
  // - lang=fr: French results first
  // - limit=5: Keep suggestions manageable

  // Map Photon response to SearchSuggestion
  // Handle network errors gracefully
  // Return [] if API fails (don't crash the app)
}
```

**API Response Example** (Photon):
```json
{
  "features": [
    {
      "properties": {
        "name": "Paris",
        "country": "France",
        "osm_type": "node",
        "osm_id": 123456,
        "type": "city"
      },
      "geometry": {
        "coordinates": [2.3522, 48.8566]
      }
    }
  ]
}
```

**Error Handling**:
- Network timeout (5s): Return empty array + log warning
- Invalid response: Return empty array + log error
- No results: Return empty array (no error)

---

### 3. MapSearchBar Component

**File**: `src/components/MapSearchBar.tsx`

```typescript
interface MapSearchBarProps {
  onLocationSelected: (location: Location, name: string) => void;
  initiallyExpanded?: boolean; // Default: false
}

// Internal State:
// - searchText: string
// - suggestions: SearchSuggestion[]
// - isLoading: boolean
// - isExpanded: boolean
```

**Key Features**:
- **Debounced Search**: Use `useDebouncedValue(searchText, 800)` hook
- **Loading State**: Show spinner while fetching suggestions
- **Empty State**: "No results" message when suggestions.length === 0
- **Keyboard Handling**: Dismiss keyboard when suggestion tapped
- **Accessibility**:
  - Search input has `accessibilityLabel="Rechercher un lieu"`
  - Suggestions have `accessibilityRole="button"`

**Layout**:
```
┌─────────────────────────────────┐
│ [🔍] Rechercher un lieu      [X]│ ← Input (collapsed: icon only)
├─────────────────────────────────┤
│ • Paris, Île-de-France          │ ← Suggestion 1
│ • Parempuyre, Nouvelle-Aquitaine│ ← Suggestion 2
│ • Paray-le-Monial, Bourgogne    │ ← Suggestion 3
└─────────────────────────────────┘
```

**Styling Notes**:
- Use `KeyboardAvoidingView` to prevent keyboard overlap
- Suggestions dropdown: `position: absolute`, `top: 60`, `zIndex: 1000`
- Shadow for depth (same as spot detail sheet)

---

### 4. MapView Integration

**File**: `src/components/MapView.tsx` (modifications)

**Add Ref Support**:
```typescript
import { forwardRef, useImperativeHandle } from 'react';

export interface MapViewRef {
  animateToRegion(region: MapRegion, duration?: number): void;
  getCurrentRegion(): MapRegion | undefined;
}

export const MapView = forwardRef<MapViewRef, MapViewProps>((props, ref) => {
  const mapRef = useRef<ReactNativeMap>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration = 1000) => {
      mapRef.current?.animateToRegion(region, duration);
    },
    getCurrentRegion: () => currentRegion,
  }));

  // ... existing code
});
```

**Why Ref?**
- Allows parent (HomeScreen) to programmatically control map
- No prop drilling needed
- Clean separation of concerns

---

### 5. HomeScreen Integration

**File**: `src/screens/HomeScreen.tsx` (modifications)

```typescript
export function HomeScreen() {
  const mapViewRef = useRef<MapViewRef>(null);

  const handleLocationSelected = (location: Location, name: string) => {
    // Calculate region with appropriate zoom level
    const region: MapRegion = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.05,  // City-level zoom
      longitudeDelta: 0.05,
    };

    // Animate map
    mapViewRef.current?.animateToRegion(region, 1000);

    // Optional: Show toast "Navigation vers {name}"
    logger.info(`Map navigated to ${name}`);
  };

  return (
    <View style={styles.container}>
      <MapSearchBar onLocationSelected={handleLocationSelected} />
      <MapView ref={mapViewRef} {...existingProps} />
      {/* ... journey controls, etc. */}
    </View>
  );
}
```

**Z-Index Layering** (top to bottom):
1. MapSearchBar (z-index: 1000)
2. Journey controls (z-index: 500)
3. MapView (z-index: 0)

---

## 🧪 Testing Strategy

### Manual Testing Checklist

**Search Functionality**:
- [ ] Typing triggers suggestions after 800ms
- [ ] Suggestions update as user types
- [ ] Loading spinner shows during API call
- [ ] "No results" message for gibberish input
- [ ] French places appear first (Paris before Paris, Texas)

**Map Navigation**:
- [ ] Tapping suggestion animates map smoothly
- [ ] Map centers on correct coordinates
- [ ] Zoom level is appropriate (not too close/far)
- [ ] Search bar collapses after selection

**Edge Cases**:
- [ ] Network offline: No crash, shows "No results"
- [ ] API timeout: Graceful fallback
- [ ] Empty search: No API call
- [ ] Rapid typing: Only last query fires (debounce works)
- [ ] Special characters (é, è, ç): Handled correctly

**Performance**:
- [ ] No lag while typing
- [ ] Suggestions render quickly (<500ms)
- [ ] No memory leaks (test with 20+ searches)

### Automated Tests (Future)

**Unit Tests** (`geocodingService.test.ts`):
- Mock Photon API responses
- Test error handling (network failure, invalid JSON)
- Test empty query handling

**Component Tests** (`MapSearchBar.test.tsx`):
- Test debounce behavior
- Test suggestion selection
- Test expand/collapse states

---

## 📦 Dependencies

**New Dependencies**: NONE ✅
(React Native, Expo SDK already includes networking via `fetch`)

**Existing Dependencies Used**:
- `react-native-maps` - Map animation via refs
- React hooks - useState, useEffect, useRef, useMemo

---

## 🚀 Implementation Phases

### Phase 1: Geocoding Service ✅ COMPLETED
- [x] Create `src/services/geocodingService.ts`
- [x] Implement Photon API client
- [x] Add types (SearchSuggestion only - no unused interfaces)
- [x] Test with sample queries (Paris, Lyon, Bordeaux - all working)

### Phase 2: MapSearchBar Component ✅ COMPLETED
- [x] Create `src/components/MapSearchBar.tsx`
- [x] Implement search input with debounce
- [x] Implement suggestions dropdown
- [x] Add loading/empty states
- [x] Style according to app design

### Phase 3: MapView Ref Support ✅ COMPLETED
- [x] Add `forwardRef` to MapView
- [x] Expose `animateToRegion()` method
- [x] Expose `getCurrentRegion()` method
- [x] Test ref calls from parent

### Phase 4: HomeScreen Integration ✅ COMPLETED
- [x] Add MapSearchBar to HomeScreen
- [x] Connect `onLocationSelected` handler
- [x] Handle z-index layering
- [x] Test end-to-end flow

### Phase 5: Polish & Testing (1-2h)

#### Polish Tasks:
1. **Search Bar Animations**:
   - Smooth expand/collapse transition (300ms duration)
   - Fade-in for suggestions dropdown
   - Optional: Slide-up animation when suggestions appear
2. **Haptic Feedback**:
   - Add light haptic on suggestion tap (using `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`)
   - Add haptic on successful map navigation
3. **Visual Polish**:
   - Ensure search bar shadow matches app design
   - Verify suggestion item press states (background color change)
   - Check keyboard dismiss behavior is smooth

#### Testing Tasks:
1. **Manual Testing** (use checklist in "Testing Strategy" section):
   - Search functionality (debounce, loading, suggestions)
   - Map navigation (animation, centering, zoom)
   - Edge cases (offline, timeout, empty search, special chars)
   - Performance (no lag, quick render, no memory leaks)
2. **Code Quality**:
   - Run `pnpm lint` - Biome must pass
   - Run `npx tsc --noEmit` - No TypeScript errors
   - Verify no `any` types
   - Verify no `console.log` (only logger usage)
3. **Cross-Platform**:
   - Test on iOS simulator
   - Test on Android emulator (if available)
   - Verify keyboard behavior on both platforms

**Total Estimated Time**: 5-8 hours

---

## 🌍 Future Enhancements (NOT FOR NOW)

**DO NOT implement these - they're listed for awareness only:**
- Reverse geocoding, recent searches, favorites, region bias
- Self-hosted Photon, offline search, voice search
- Worldwide expansion configuration

**When needed, we'll implement them. Not before.**

---

## 📚 References

- **Photon API Docs**: https://photon.komoot.io/
- **OpenStreetMap**: https://www.openstreetmap.org/
- **react-native-maps Ref API**: https://github.com/react-native-maps/react-native-maps/blob/master/docs/mapview.md#methods

---

## ✅ Acceptance Criteria

- [ ] Search bar appears at top of map
- [ ] Typing shows suggestions after 800ms
- [ ] Tapping suggestion navigates map to location
- [ ] Works for French cities (Paris, Lyon, Marseille)
- [ ] Graceful handling of network errors
- [ ] No new dependencies added
- [ ] Code follows "Less Is More" philosophy
- [ ] TypeScript with no `any` types
- [ ] Biome lint passes
- [ ] No console.log (use logger)

---

**Ready to implement?** Follow phases 1-5 sequentially. Test each phase before moving to the next.
