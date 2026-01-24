# Feature 5: Group Tracking

**Status**: 📋 **PLANNED**

**Goal**: Allow hitchhikers traveling together to see each other's location.

---

## 5.1 Data Model

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

---

## 5.2 Implementation

- [ ] Create `src/group/` feature module
- [ ] Real-time location sync (Firebase Realtime DB / Supabase Realtime)
- [ ] Background location updates with `expo-location`
- [ ] Battery-efficient tracking (significant location changes only)

---

## 5.3 Features

- [ ] Create/join group with invite code
- [ ] See all members on map
- [ ] Pause/resume location sharing
- [ ] Auto-detect status (moving = in vehicle, stationary at spot)
- [ ] Group chat (simple text messages)
- [ ] Group expiration (24h/48h/1 week)

---

## 5.4 Privacy

- [ ] Explicit consent to share location
- [ ] Easy toggle to stop sharing
- [ ] No location history stored (only current position)
- [ ] Group auto-deletes after expiration

---

## Implementation Checklist

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

---

## Estimated Effort

**3 weeks**

**Priority**: 🟡 Lower (Phase 3: Advanced Features)

**Dependencies**: Real-time sync infrastructure
