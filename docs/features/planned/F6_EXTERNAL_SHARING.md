# Feature 6: External Location Sharing

**Status**: 📋 **PLANNED**

**Goal**: Share real-time location with non-app users (family, friends).

---

## 6.1 Concept

```
Hitchhiker generates a secure link:
https://hitchit.app/track/abc123

Anyone with link can see:
- Current location on map
- Last update time
- "En route vers Bayonne"
- Battery level indicator
```

---

## 6.2 Implementation

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

---

## 6.3 Security

- [ ] Links expire automatically
- [ ] User can revoke link anytime
- [ ] Rate limit link generation
- [ ] No personal info exposed (just location + destination)
- [ ] Optional PIN protection

---

## 6.4 UI

- [ ] "Share my location" button in navigation mode
- [ ] Copy link / share via native share sheet
- [ ] Active shares list with revoke option
- [ ] "X people viewing your location" indicator

---

## Implementation Checklist

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

---

## Estimated Effort

**1.5 weeks**

**Priority**: 🟠 Medium (Phase 2: High-Value Features)

**Dependencies**: Backend infrastructure for tracking links
