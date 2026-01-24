# Feature 4: Longway - Extended Drop-off Suggestions

**Status**: 📋 **PLANNED**

**Goal**: Help drivers go a bit further to leave hitchhiker at better spots.

---

## 4.1 Concept

```
Driver destination: Dax
Hitchhiker destination: Bayonne (30min further)

Longway suggestions:
- "Aire de Saubrigues" (7min detour) - Good spot
- "Sortie Bayonne Nord" (12min detour) - Near destination
```

---

## 4.2 Configuration

```typescript
// src/constants/routing.ts
export const LONGWAY_CONFIG = {
  nearbySpotMaxDetourMinutes: 7,
  destinationMaxDetourMinutes: 15,
  searchRadiusKm: 20,
} as const;
```

---

## 4.3 Implementation

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

---

## 4.4 UI

- [ ] Add "Longway" toggle in route planning
- [ ] Show suggestions as chips: "Aire de X (+5min)"
- [ ] Explain benefit to driver: "Help them reach a better spot"

---

## Implementation Checklist

- [ ] Define LONGWAY_CONFIG constants
- [ ] Implement `findLongwayOptions()` service
- [ ] Calculate actual detour times (not straight-line)
- [ ] Implement spot ranking algorithm
- [ ] Build Longway suggestions UI
- [ ] Add Longway toggle in route planning
- [ ] Create suggestion chips component
- [ ] Add driver benefit explanation

---

## Estimated Effort

**1 week**

**Priority**: 🟡 Lower (Phase 3: Advanced Features)

**Dependencies**: F3 (Double Itinerary Calculator)
