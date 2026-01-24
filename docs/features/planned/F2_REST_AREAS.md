# Feature 2: Highway Rest Areas Database

**Status**: 📋 **PLANNED**

**Goal**: Pre-populate all French highway rest areas ("aires de repos") as potential hitchhiking spots.

---

## 2.1 Data Source

- [ ] Source data from OpenStreetMap (amenity=rest_area + highway=services)
- [ ] Include: name, coordinates, highway reference, facilities
- [ ] Create import script `scripts/import-rest-areas.ts`

---

## 2.2 Data Model

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

---

## 2.3 Implementation

- [ ] Create `src/restArea/` feature module
- [ ] Import ~400 French rest areas into local database
- [ ] Show rest areas on map with distinct marker style
- [ ] Allow converting rest area to hitchhiking spot
- [ ] Link existing spots to nearby rest areas automatically

---

## 2.4 Offline Data

- [ ] Bundle rest area data with app (static JSON)
- [ ] Update via OTA when new rest areas added
- [ ] ~50KB compressed dataset

---

## Implementation Checklist

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

---

## Estimated Effort

**1 week**

**Priority**: 🟠 Medium (Phase 2: High-Value Features)
