# Hitch-It Roadmap

> **Last Updated**: 2026-02-25

## 🎯 Current Focus

**In Progress**:

- [Navigation & Journey Integration](features/implemented/FEATURE_NAVIGATION_JOURNEY_INTEGRATION.md) - Navigation feature complete; journey integration testing & stabilization pending

**Next Up**:

- F12: Save Journey Feature - Post-trip enrichment and review
- F8: User Profile & Travel History - Track hitchhiking stats

---

## 📊 Feature Status

### ✅ Implemented (3 features)

| Feature                | File                                                                          | Completed  |
| ---------------------- | ----------------------------------------------------------------------------- | ---------- |
| Spot Management        | [FEATURE_SPOT_MANAGEMENT.md](features/implemented/FEATURE_SPOT_MANAGEMENT.md) | 2025-12    |
| Journey Recording (v2) | [F11_JOURNEY_RECORDING.md](features/implemented/F11_JOURNEY_RECORDING.md)     | 2026-01-23 |
| Map Search             | [FEATURE_MAP_SEARCH.md](features/implemented/FEATURE_MAP_SEARCH.md)           | 2026-01-24 |

### ✅ Implemented (1 feature, validation pending)

| Feature                          | File                                                                                                        | Build Status | Validation Status |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------ | ----------------- |
| Navigation & Journey Integration | [FEATURE_NAVIGATION_JOURNEY_INTEGRATION.md](features/implemented/FEATURE_NAVIGATION_JOURNEY_INTEGRATION.md) | ✅ Navigation complete | 🧪 Journey integration tests pending |

### 📋 Phase 1: Critical Foundation (2 features)

**Goal**: Complete journey lifecycle (record → navigate → save → review)

| Priority | Feature           | Effort | Dependencies  | File                                                        |
| -------- | ----------------- | ------ | ------------- | ----------------------------------------------------------- |
| 🔴 High  | F12: Save Journey | Medium | Navigation ✅ | [F12_SAVE_JOURNEY.md](features/planned/F12_SAVE_JOURNEY.md) |
| 🔴 High  | F8: User Profile  | Medium | Auth          | [F8_USER_PROFILE.md](features/planned/F8_USER_PROFILE.md)   |

### 📋 Phase 2: High-Value Features (4 features)

**Goal**: Enhance spot discovery and sharing capabilities

| Priority  | Feature                     | Effort | File                                                                            |
| --------- | --------------------------- | ------ | ------------------------------------------------------------------------------- |
| 🟠 Medium | F1: Spot Pictures           | Medium | [F1_SPOT_PICTURES.md](features/planned/F1_SPOT_PICTURES.md)                     |
| 🟠 Medium | F2: Rest Areas              | Low    | [F2_REST_AREAS.md](features/planned/F2_REST_AREAS.md)                           |
| 🟠 Medium | F6: External Sharing        | Medium | [F6_EXTERNAL_SHARING.md](features/planned/F6_EXTERNAL_SHARING.md)               |
| 🟠 Medium | F7: Destination Suggestions | Low    | [F7_DESTINATION_SUGGESTIONS.md](features/planned/F7_DESTINATION_SUGGESTIONS.md) |

### 📋 Phase 3: Advanced Features (5 features)

**Goal**: Advanced routing, social features, gamification

| Priority | Feature              | Effort | File                                                              |
| -------- | -------------------- | ------ | ----------------------------------------------------------------- |
| 🟡 Lower | F3: Double Itinerary | High   | [F3_DOUBLE_ITINERARY.md](features/planned/F3_DOUBLE_ITINERARY.md) |
| 🟡 Lower | F4: Longway          | Medium | [F4_LONGWAY.md](features/planned/F4_LONGWAY.md)                   |
| 🟡 Lower | F5: Group Tracking   | High   | [F5_GROUP_TRACKING.md](features/planned/F5_GROUP_TRACKING.md)     |
| 🟡 Lower | F9: Community        | High   | [F9_COMMUNITY.md](features/planned/F9_COMMUNITY.md)               |
| 🟡 Lower | F10: Badges          | Medium | [F10_BADGES.md](features/planned/F10_BADGES.md)                   |

---

## 📈 Progress Metrics

- **Core Features**: 3/3 complete (100%) ✅
  - Spot Management ✅
  - Journey Recording ✅
  - Map Search ✅
- **Navigation**: 1/1 complete (✅)
- **Journey integration validation**: pending (manual test pass + bugfix loop)
- **Phase 1 (Critical)**: 0/2 complete (0%)
- **Phase 2 (High-Value)**: 0/4 complete (0%)
- **Phase 3 (Advanced)**: 0/5 complete (0%)
- **Overall Advanced Features**: 0/11 complete (0%)

---

## 🗓️ Timeline Estimate

| Phase       | Duration    | Features                                               |
| ----------- | ----------- | ------------------------------------------------------ |
| **Current** | 3-5 days    | Journey integration testing + stabilization            |
| **Phase 1** | 4-5 weeks   | F12 Save Journey, F8 User Profile                      |
| **Phase 2** | 5-6 weeks   | F1 Pictures, F2 Rest Areas, F6 Sharing, F7 Suggestions |
| **Phase 3** | 10-12 weeks | F3-F5 Advanced Routing, F9-F10 Social/Gamification     |

**Total**: ~6 months for complete feature set

---

## 🏗️ Architecture Overview

```
src/
├── components/        # Shared UI (Header, Toast, MapView, etc.)
├── screens/           # Screen components
├── spot/              # ✅ Spot management (DDD feature module)
├── journey/           # ✅ Journey recording (DDD feature module)
├── navigation/        # ✅ Navigation & routing (DDD feature module)
├── lib/               # External integrations (Supabase)
├── hooks/             # Shared hooks
├── constants/         # App constants
├── utils/             # Utilities + logger
└── types/             # Shared TypeScript types
```

**Philosophy**: Feature-based Domain-Driven Design (DDD)

- Each feature is self-contained module
- Modules contain: components, services, context, hooks, types
- See [../CLAUDE.md](../CLAUDE.md) for full architecture details

---

## 🔄 Workflow

### Adding a New Feature

1. Create spec in `docs/features/planned/FEATURE_NAME.md`
2. Update this roadmap with link and priority
3. When starting work → Move to `in-progress/`
4. When complete → Move to `implemented/` + update metrics

### Feature Spec Template

See [FEATURE_TEMPLATE.md](FEATURE_TEMPLATE.md) for structure (or copy existing feature files).

**Key Sections**:

- 📋 Overview (status, priority, complexity, dependencies)
- 🎯 User Story (flow)
- 🎨 UX/UI Specification (mockups, states)
- 🏗️ Technical Architecture (module structure, data models)
- 🔧 Technical Implementation Tickets (detailed tasks)
- 📦 Dependencies (new packages, APIs)
- 🚀 Implementation Phases
- ✅ Acceptance Criteria

---

## 📚 Key Documentation

- [CLAUDE.md](../CLAUDE.md) - Project philosophy, conventions, code standards
- [AGENTS.md](../AGENTS.md) - Technical documentation for AI agents
- [FEATURE_TEMPLATE.md](FEATURE_TEMPLATE.md) - Template for new features

---

## 🎯 Philosophy: Less Is More

> "A good developer is the one who removes lines of code"

**Before adding a feature**:

1. Is it in this roadmap? (If not, discuss first)
2. Is this the simplest solution?
3. Can existing code achieve the same?
4. Will I understand this in 6 months?

**Acceptable**: Simple functions, direct dependencies, explicit code
**Avoid**: Clever abstractions, deep nesting, magic behavior, premature optimization

See [CLAUDE.md](../CLAUDE.md) for full philosophy.

---

## 📝 Notes

- This is a **solo project** - maintainability is #1 priority
- All features use **pnpm** (never npm or yarn)
- Target audience: **French hitchhikers** (French UI)
- Backend: **Supabase** (PostgreSQL, RLS, Realtime)
- Follow **DDD** (Domain-Driven Design) for feature modules

---

**Questions?** Check [CLAUDE.md](../CLAUDE.md) or [AGENTS.md](../AGENTS.md)
