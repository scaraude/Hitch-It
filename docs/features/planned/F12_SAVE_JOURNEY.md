# Feature 12: Save Journey Feature

**Status**: 📋 **PLANNED**

**Goal**: After completing a trip, save and correct the recorded journey.

---

## 12.1 Flow

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

---

## 12.2 Journey Review Screen

- [ ] Timeline view of all detected steps
- [ ] Edit each step:
  - Change type (waiting → break)
  - Adjust times
  - Add/remove spots
  - Add notes
- [ ] Correct spot information (if auto-detected incorrectly)
- [ ] Add photos to steps
- [ ] Rate overall journey

---

## 12.3 Data Corrections

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

---

## 12.4 Journey Statistics

After saving, show:
- Total distance
- Total time
- Time waiting vs. traveling
- Average ride length
- Spots used (with option to rate)

---

## Implementation Checklist

- [ ] Create journey review screen (show path on map)
- [ ] Display stops as markers on map
- [ ] Stop enrichment UI:
  - [ ] Link stop to existing spot (or create new)
  - [ ] Add wait time
  - [ ] Add notes
- [ ] Add journey title and notes
- [ ] Calculate and display statistics (distance, duration)
- [ ] Journey history list

---

## Estimated Effort

**1.5 weeks**

**Priority**: 🔴 High (Phase 1: Critical Foundation)

**Dependencies**: F11 (Journey Recording)
