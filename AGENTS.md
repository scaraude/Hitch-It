# Hitch-It - Technical Guide for AI Agents

> Reference guide for contributors and coding agents. Keep this repo clean, typed, and easy to evolve.

---

## 1) Project Overview

Hitch-It is a React Native mobile app for French hitchhikers to discover/share hitchhiking spots, run journey navigation, and capture trip history.

| Attribute | Value |
| --- | --- |
| Framework | React Native 0.81 + Expo 54 |
| Language | TypeScript 5.9 (`strict`) |
| Backend | Supabase (PostgreSQL) |
| Package manager | pnpm |
| Linter/formatter | Biome |
| Architecture | Feature-based clean architecture |

---

## 2) Canonical Docs

Read in this order before significant work:

1. `docs/ROADMAP.md`
2. `docs/ENGINEERING_STANDARDS.md`
3. `AGENTS.md` (this file)
4. `CLAUDE.md` (quick operational playbook)

---

## 3) Non-Negotiable Engineering Rules

1. **Library-first**: prefer reliable libraries over handmade infrastructure/components.
2. **Design-system-first**: use shared tokens + shared UI components before custom UI.
3. **Small focused code**: split large screens and mixed-responsibility files.
4. **No magic values**: extract repeated business/UI values into named constants.
5. **Strong domain types**: avoid raw `string` IDs/statuses; use branded IDs and enums/unions.
6. **Boundary parsing**: validate/sanitize external data in repositories/services.
7. **Quality gates**: `pnpm lint` and `pnpm type-check` must pass.

---

## 4) Source Layout and Responsibilities

```txt
src/
├── components/           # Shared presentational components
│   └── ui/               # Reusable design-system primitives
├── screens/              # Screen orchestration only
│   └── home/             # Home screen extracted hooks/components/styles
├── spot/                 # Spot feature
├── journey/              # Journey feature
├── navigation/           # Navigation feature
├── hooks/                # Cross-feature hooks
├── constants/            # Design tokens + app constants
├── utils/                # Shared utilities (logger, geo/date, etc.)
├── lib/                  # External clients (Supabase)
└── types/                # Shared domain types
```

Boundary expectations:

- `screens/*`: compose state + handlers, minimal direct logic.
- `components/*`: presentation concerns only.
- `feature/hooks/*`: orchestration and side effects.
- `feature/services/*`: business rules + persistence + boundary mapping.
- `feature/types.ts`: branded IDs, enums/unions, DTO/domain models.

### Forbidden shortcuts

- Supabase calls directly from UI components.
- Raw DB payload usage directly in UI.
- Domain entities modeled with open-ended string fields.

---

## 5) Feature Module Pattern

```txt
src/[feature]/
├── components/
├── context/
├── hooks/
├── services/
├── types.ts
└── index.ts
```

When adding behavior, prefer extending existing modules before creating new parallel structures.

---

## 6) Library-First Policy

### Prefer these existing libraries

- Icons: `@expo/vector-icons`
- Maps: `react-native-maps`
- Navigation: `@react-navigation/native`, `@react-navigation/native-stack`
- Background location: `expo-location`, `expo-task-manager`
- Toasts: `react-native-toast-message` via shared `toastUtils`
- Logging: `logger` abstraction (`react-native-logs`)

### Before writing custom code

1. Check `src/components` and `src/components/ui`.
2. Check existing hooks/services in the feature.
3. Check installed dependencies.
4. If still missing, adopt a maintained library and isolate it behind local wrappers if needed.

---

## 7) Design System Rules

Design system foundation in this codebase:

- `src/constants/index.ts`: `COLORS`, `SPACING`, `SIZES`, config values
- `src/components/ui/*`: reusable UI primitives

Rules:

- No hardcoded color hex values in screen/feature files.
- No repeated inline spacing/margins when token exists.
- No duplicate button/sheet/control variants unless generalized in shared UI.
- Keep component visuals consistent with existing primitives.

---

## 8) Type Safety Rules

### IDs

Always use branded IDs for domain entities.

```ts
export type SpotId = string & { readonly brand: unique symbol };
```

### Categorical values

Use enums or strict literal unions (status, direction, type).

```ts
export enum JourneyStatus {
  InProgress = 'InProgress',
  Completed = 'Completed',
  Abandoned = 'Abandoned',
}
```

### External payloads

- Parse and sanitize Supabase/API payloads in repositories.
- Convert unknown values to safe defaults or reject with clear errors.
- Never trust remote `string` values without validation.

### Disallowed patterns

- `any`
- raw `string` where constrained type exists
- unchecked casts for external data

---

## 9) Constants and No-Magic-Value Policy

Create constants for:

- business thresholds/timeouts
- statuses and event names
- map zoom/delta presets
- repeated UI numbers (spacing, radii, sizes)

Placement:

- App-wide: `src/constants/*`
- Feature-specific: `src/<feature>/constants.ts`

Bad:

```ts
setTimeout(fn, 3000);
```

Good:

```ts
const FOLLOW_USER_TIMEOUT_MS = 3000;
setTimeout(fn, FOLLOW_USER_TIMEOUT_MS);
```

---

## 10) Component and File Size Targets

Targets for maintainability:

- Screen: <= 300 lines (hard max 400)
- Reusable component: <= 150 lines
- Hook/service files: ideally <= 200 lines
- Function: ideally <= 30 lines

If a file has 3+ responsibilities, split it.

---

## 11) HomeScreen Refactor Pattern (Reference)

For large orchestration screens:

1. Keep map/render layer in separate component.
2. Extract flow-specific hooks (search, map interactions, journey session, sheet flow).
3. Keep screen file focused on composition and wiring.
4. Move shared local types to `screens/<screen>/types.ts`.

---

## 12) Data Access and Repository Rules

Repository responsibilities:

- map DB rows to domain entities
- convert date/value formats
- validate enum-like fields
- hide query details from UI/hooks

Do not return raw Supabase rows to screen components.

---

## 13) Database Schema (Current)

### `spots`

```sql
id TEXT PRIMARY KEY,
latitude DOUBLE PRECISION,
longitude DOUBLE PRECISION,
road_name TEXT,
direction TEXT,
destinations JSONB,
created_by TEXT,
created_at TIMESTAMPTZ,
updated_at TIMESTAMPTZ
```

### `comments`

```sql
id TEXT PRIMARY KEY,
spot_id TEXT REFERENCES spots(id) ON DELETE CASCADE,
appreciation TEXT,
comment TEXT,
created_by TEXT,
created_at TIMESTAMPTZ,
updated_at TIMESTAMPTZ
```

### `journeys`

```sql
id TEXT PRIMARY KEY,
user_id TEXT,
status TEXT,
started_at TIMESTAMPTZ,
ended_at TIMESTAMPTZ,
title TEXT,
notes TEXT,
total_distance_km DOUBLE PRECISION,
is_shared BOOLEAN,
share_token TEXT,
created_at TIMESTAMPTZ,
updated_at TIMESTAMPTZ
```

### `journey_points`

```sql
id TEXT PRIMARY KEY,
journey_id TEXT REFERENCES journeys(id) ON DELETE CASCADE,
type TEXT,
spot_id TEXT REFERENCES spots(id),
latitude DOUBLE PRECISION,
longitude DOUBLE PRECISION,
timestamp TIMESTAMPTZ,
wait_time_minutes INTEGER,
notes TEXT,
created_at TIMESTAMPTZ
```

---

## 14) MCP Tools Available

### Supabase MCP

URL: `https://mcp.supabase.com/mcp?project_ref=nyniwfqrvlztwhnexheu`

- `search_docs`
- `list_tables`
- `execute_sql`
- `apply_migration`
- `get_logs`
- `get_advisors`
- `generate_typescript_types`

### React Native Guide MCP

- `analyze_component`
- `analyze_codebase_performance`
- `optimize_performance`
- `debug_issue`
- `refactor_component`
- `generate_component_test`

---

## 15) Development Commands

```bash
# Run app
pnpm start
pnpm ios
pnpm android

# Code quality
pnpm lint
pnpm lint:fix
pnpm type-check
```

---

## 16) Quality Checklist (Before Merge)

- [ ] No new magic strings/numbers
- [ ] No raw domain `string` IDs/statuses
- [ ] Reused existing component/hook/library where possible
- [ ] No `console.log` (use `logger`)
- [ ] Error paths handled and user feedback shown when needed
- [ ] `pnpm lint` passes
- [ ] `pnpm type-check` passes

---

## 17) Troubleshooting

### Metro cache issues

```bash
pnpm start --reset-cache
```

### Type generation (Supabase)

Use Supabase MCP: `generate_typescript_types`

### Background location issues

- iOS: verify `UIBackgroundModes` in `app.json`
- Android: verify foreground service configuration

---

## 18) Environment

- Platform: macOS
- Node: `>=18`
- iOS simulator: Xcode required
- Android emulator: Android Studio + AVD required

Supabase project: `nyniwfqrvlztwhnexheu`
