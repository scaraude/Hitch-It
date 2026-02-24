# Hitch-It Engineering Standards

> This is the source of truth for keeping architecture clean and technical debt low.

## 1) Goals

- Keep code easy to change by one developer.
- Favor proven libraries over custom implementations.
- Keep domain logic typed, explicit, and testable.
- Keep UI consistent via a design system and shared primitives.

## 2) Non-Negotiable Rules

1. **Library-first**: Do not build custom infra/UI if a stable library already solves it.
2. **Design-system-first**: Use shared tokens and shared UI components before creating new styles.
3. **Small focused units**: Split screens into small components/hooks/services.
4. **No magic values**: Strings/numbers/colors used more than once must become named constants.
5. **No primitive obsession**: Avoid raw `string` IDs and ad hoc status strings in domain code.
6. **Boundary mapping**: Parse and validate external data at repository/service boundaries.
7. **Quality gates**: `pnpm lint` and `pnpm type-check` must pass before merge.

## 3) Clean Architecture Boundaries

- `screens/`: composition only (wire hooks/components/providers).
- `components/`: reusable presentational UI (no business logic).
- `feature/hooks/`: UI orchestration + feature interactions.
- `feature/services/`: business logic, data access, boundary parsing.
- `feature/context/`: state exposure and action wiring.
- `types/`: branded IDs, enums/unions, DTO/domain contracts.

### Forbidden cross-layer shortcuts

- UI components querying Supabase directly.
- Screens containing domain calculations/parsing.
- Repository returning raw DB rows without mapping.
- Domain entities using raw unbounded strings for statuses/types.

## 4) Library-First Policy

Use existing dependencies first.

### Existing preferred libraries in this repo

- Icons: `@expo/vector-icons`
- Toasts: `react-native-toast-message` via `toastUtils`
- Maps: `react-native-maps` through shared map wrapper
- Navigation: `@react-navigation/*`
- Location/background: `expo-location`, `expo-task-manager`
- Logging: `react-native-logs` via `logger`

### Before writing custom code

1. Check existing local component/hook/service first.
2. Check installed dependencies.
3. If missing, choose a well-maintained library (active releases, adoption, docs).
4. Wrap external APIs in local adapters if needed to keep call-sites simple.

## 5) Design System Rules

Current DS foundation:

- Tokens: `src/constants/index.ts` (`COLORS`, `SPACING`, `SIZES`)
- Shared UI primitives: `src/components/ui/*`

Rules:

- No hardcoded hex colors in feature/screen files.
- No ad hoc spacing values when token exists.
- Extend shared primitives before creating one-off component variants.
- Keep visual behavior consistent (button heights, radii, spacing rhythm).

## 6) Component and File Size Rules

Targets (not absolute, but enforced during review):

- Screen component: <= 300 lines (hard max 400)
- Reusable component: <= 150 lines
- Hook/service function: <= 30 lines per function where possible
- File complexity: if a file has 3+ responsibilities, split it

Split strategy for large screen files:

1. Extract map/render layer.
2. Extract feature flow hooks (search, navigation session, sheet flow).
3. Extract derived state selectors.
4. Keep screen as orchestration shell.

## 7) Type Safety Rules

### IDs and entity references

- Use branded IDs for entities (`SpotId`, `TravelId`, etc.).
- Never pass raw string IDs across domain boundaries.

### Categorical values

- Use enums or strict literal unions for statuses/types/directions.
- No open-ended status strings.

### External data parsing

- Parse DB/API payloads in repositories.
- Reject or sanitize unknown enum values.
- Convert nullable/optional wire fields to explicit domain shapes.

### Disallowed patterns

- `any`
- broad `string` where constrained type exists
- unchecked type assertions from remote data

## 8) Constants and Magic Values

Create named constants when:

- A string/number appears in multiple places.
- A value encodes business meaning (`ROUTE_ZOOM_LEVEL`, `FOLLOW_USER_TIMEOUT_MS`).
- A UI value affects consistency (spacing/radius/opacity).

Placement:

- App-wide constants -> `src/constants/*`
- Feature-specific constants -> `src/<feature>/constants.ts`

## 9) State and Side Effects

- Keep async side effects in hooks/services, not in render blocks.
- Always clean up timers/subscriptions/tasks in effect cleanup.
- Guard async state updates for unmounted components.
- Prefer derived state (`useMemo`) over duplicated state.

## 10) Errors, Logging, and Reliability

- Use `logger` instead of `console.log`.
- Log failures with context (IDs, route, operation).
- Show user-facing failures through `toastUtils` with clear copy.
- Do not swallow errors silently.

## 11) Quality Gates

Mandatory before merge:

```bash
pnpm lint
pnpm type-check
```

Recommended for risky changes:

- Add/update tests around extracted hooks/services.
- Run feature manually on iOS/Android simulator for regressions.

## 12) Refactor Decision Framework

Refactor when at least one applies:

- File is too large or has mixed responsibilities.
- Same logic duplicated 3+ times.
- Manual code reimplements a stable library capability.
- Raw strings/IDs create type or runtime risks.

Do not refactor blindly:

- Keep behavior unchanged unless requested.
- Move in small safe steps.
- Validate after each extraction.

## 13) Definition of Done (Clean Implementation)

- Architecture boundaries respected.
- Reused existing library/component when available.
- No new magic strings/numbers.
- Domain types are constrained and explicit.
- File/component complexity reduced (or at least not increased).
- Lint and type-check pass.

