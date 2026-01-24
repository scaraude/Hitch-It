# Feature 10: User Badges & Gamification

**Status**: 📋 **PLANNED**

**Goal**: Reward active users and encourage positive behavior.

---

## 10.1 Badge Categories

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

---

## 10.2 Example Badges

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

---

## 10.3 Implementation

- [ ] Create `src/badges/` feature module
- [ ] Badge progress tracking
- [ ] Unlock notifications with animation
- [ ] Badge display on profile
- [ ] Leaderboards (optional, opt-in)

---

## Implementation Checklist

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

## Estimated Effort

**1.5 weeks**

**Priority**: 🟡 Lower (Phase 3: Advanced Features)

**Dependencies**: F8 (User Profile), activity tracking
