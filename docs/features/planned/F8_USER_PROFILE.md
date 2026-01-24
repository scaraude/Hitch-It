# Feature 8: User Profile & Travel History

**Status**: 📋 **PLANNED**

**Goal**: Let users track their hitchhiking journeys and stats.

---

## 8.1 Data Model

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

---

## 8.2 Implementation

- [ ] Create `src/user/` feature module
- [ ] Profile screen with stats dashboard
- [ ] Travel list with expandable details
- [ ] Manual travel logging (for past trips)
- [ ] Auto-detection during navigation (see Feature 11)

---

## 8.3 Stats Display

- [ ] Total km hitchhiked
- [ ] Average wait time
- [ ] Best/worst spots used
- [ ] Monthly/yearly breakdown
- [ ] Achievements unlocked

---

## Implementation Checklist

- [ ] Create `src/user/` feature module
- [ ] Define UserProfile, UserStats data models
- [ ] Create user_profiles database table
- [ ] Build profile screen UI
- [ ] Implement stats calculation service
- [ ] Build journey history list component
- [ ] Integrate with F11 for automatic journey tracking

---

## Estimated Effort

**2 weeks**

**Priority**: 🔴 High (Phase 1: Critical Foundation)

**Dependencies**: Authentication system
