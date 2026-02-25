# Feature 3: Double Itinerary Calculator

**Status**: ✅ Implemented

**Goal**: Calculate parallel routes for hitchhiker and driver to find the last common spot.

---

## 3.1 Concept

```
Hitchhiker: Bordeaux → Bayonne (A63)
Driver: Bordeaux → Pau (A64)

Common path: Bordeaux → Aire de Labenne (A63/A64 split)
Suggestion: "Get dropped at Aire de Labenne to continue south"
```

---

## 3.2 Implementation

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

---

## 3.3 UI Components

- [ ] Create `DoubleRouteSheet` bottom sheet
- [ ] Show both routes on map with different colors
- [ ] Highlight common path segment
- [ ] Mark suggested drop-off point
- [ ] Display "X min detour for driver" info

---

## Implementation Checklist

- [ ] Create `src/routing/` feature module
- [ ] Integrate routing API (Mapbox/OpenRouteService)
- [ ] Implement path intersection algorithm
- [ ] Create `calculateDoubleRoute` service
- [ ] Find optimal drop-off point logic
- [ ] Build `DoubleRouteSheet` component
- [ ] Implement dual-route map overlay
- [ ] Add common path highlighting
- [ ] Display detour time calculation

---

## Estimated Effort

**2 weeks**

**Priority**: 🟡 Lower (Phase 3: Advanced Features)

**Dependencies**: Routing API integration
