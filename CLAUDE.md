# Hitch-It - Claude Code Configuration

> A hitchhiking companion app for French hitchhikers

## Quick Reference

| Command | Description |
|---------|-------------|
| `pnpm start` | Start Metro bundler |
| `pnpm ios` | Run on iOS simulator |
| `pnpm android` | Run on Android emulator |
| `pnpm lint` | Run Biome linter |
| `npx tsc --noEmit` | TypeScript check |

**Package Manager**: `pnpm` (always use pnpm, never npm or yarn)

---

## Project Context

- **Target audience**: French hitchhikers
- **Territory**: France
- **Language**: French UI
- **Solo project**: Maintainability is the #1 priority

### Key Files

- [FEATURES_IMPLEMENTATION_PLAN.md](FEATURES_IMPLEMENTATION_PLAN.md) - Roadmap with all planned features and current progress
- [AGENTS.md](AGENTS.md) - Detailed technical documentation for AI agents

---

## Architecture

**Feature-based DDD** (Domain-Driven Design):

```
src/
├── components/        # Shared UI (Header, Toast, MapView, etc.)
├── screens/           # Screen components
├── spot/              # Spot management feature
├── journey/           # Journey recording feature
├── lib/               # External integrations (Supabase)
├── hooks/             # Shared hooks
├── constants/         # App constants
├── utils/             # Utilities + logger
└── types/             # Shared TypeScript types
```

Each feature module contains: `components/`, `services/`, `context/`, `hooks/`, `types.ts`, `index.ts`

---

## Philosophy: Less Is More

### The Golden Rule

> "A good developer is the one who removes lines of code"

This is a **solo project**. Every line of code is a liability you'll have to maintain. Before writing anything, ask:

1. **Do I really need this?** - Can I achieve the same with existing code?
2. **Is this the simplest solution?** - Complexity is your enemy
3. **Will I understand this in 6 months?** - If not, simplify

### Complexity Budget

| Acceptable | Avoid |
|------------|-------|
| Simple functions (<20 lines) | Clever abstractions |
| Direct dependencies | Deep nesting |
| Explicit code | Magic/implicit behavior |
| Built-in solutions | Custom implementations |

### Anti-Patterns to Avoid

- **Over-engineering**: Don't build for hypothetical futures
- **Premature abstraction**: Wait until you have 3+ duplicates
- **Micro-optimization**: Profile first, optimize second
- **Feature creep**: Stick to the roadmap

---

## Clean Code Rules

### KISS > DRY > SOLID

1. **KISS** (Keep It Simple): The simplest solution that works
2. **DRY** (Don't Repeat): Only after 3+ duplications
3. **SOLID**: Apply when complexity demands it

### Code Standards

- **Descriptive names**: Code should read like prose
- **Small functions**: One thing, done well
- **Self-documenting**: Comments only for "why", never "what"
- **TypeScript**: No `any` - ever
- **Explicit over implicit**: Be obvious, not clever

### TypeScript Conventions

**Enums** (PascalCase keys):
```typescript
enum Direction {
  North = "North",
  NorthEast = "North-East",
}
```

**Branded Types** (for IDs):
```typescript
export type SpotId = string & { readonly brand: unique symbol };
export type TravelId = string & { readonly brand: unique symbol };

// TypeScript prevents: spot.id = travelId (compile error!)
```

---

## Domain Models

### Spot
```typescript
{
  id: SpotId;
  latitude: number;
  longitude: number;
  appreciation: "Perfect" | "Good" | "Bad";
  roadName: string;
  direction: Direction; // 8 compass points
  destinations: string[];
  createdAt: Date;
  createdBy: UserId;
}
```

### Travel (Journey)
```typescript
{
  id: TravelId;
  userId: UserId;
  origin: string;
  destination: string;
  status: "InProgress" | "Completed" | "Abandoned";
  steps: TravelStep[];
  totalDistance: number;
  totalWaitTime: number;
}
```

---

## Backend

**Supabase** handles:
- PostgreSQL database
- Row-Level Security (RLS)
- Real-time subscriptions (future)
- Storage (future)

Tables: `spots`, `travels`, `travel_steps`

---

## Code Review Checklist

Before any PR/commit, verify:

- [ ] No unused imports or variables
- [ ] No `any` types
- [ ] Functions < 30 lines
- [ ] No deeply nested conditions (max 2 levels)
- [ ] Error handling is minimal but present
- [ ] No commented-out code
- [ ] No console.log (use logger)
- [ ] do the checks (biomes, ts)

---

## When to Say No

Refuse to implement:
- Features not in [FEATURES_IMPLEMENTATION_PLAN.md](FEATURES_IMPLEMENTATION_PLAN.md)
- "Nice to have" additions mid-task
- Over-engineered solutions
- Premature optimizations
- Unused exports or types

If asked for something complex, suggest the simpler alternative.
