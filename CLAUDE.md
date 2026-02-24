# Hitch-It - Claude Code Playbook

> Fast reference for consistent, low-debt development.

## Project Snapshot

- App: Hitch-It (React Native + Expo)
- Language: TypeScript strict mode
- Package manager: `pnpm`
- Architecture: feature-based clean architecture
- Canonical standards: `docs/ENGINEERING_STANDARDS.md`

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm start` | Start Metro |
| `pnpm ios` | Run iOS |
| `pnpm android` | Run Android |
| `pnpm lint` | Lint with Biome |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm type-check` | TypeScript checks |

## Read First

1. `docs/ROADMAP.md`
2. `docs/ENGINEERING_STANDARDS.md`
3. `AGENTS.md`

## Core Rules (Must Follow)

1. Prefer library solutions over handmade code.
2. Reuse shared UI/design tokens before creating new UI patterns.
3. Keep screens as orchestration shells; extract logic into hooks/services.
4. Avoid magic strings/numbers; use constants.
5. Avoid generic `string` for domain IDs/statuses; use branded IDs and enums/unions.
6. Parse and validate external data in repositories.
7. Keep files/components small and focused.

## Library-First Development

Use installed libraries before custom code:

- Icons: `@expo/vector-icons`
- Navigation: `@react-navigation/*`
- Maps: `react-native-maps`
- Location/background: `expo-location`, `expo-task-manager`
- Toasts: `react-native-toast-message` (via `toastUtils`)
- Logging: `logger`

If a library is missing:

1. Verify local code does not already solve it.
2. Choose a stable, maintained, documented library.
3. Wrap library usage behind local adapters when needed.

## Design System Rules

Design system foundation:

- Tokens: `src/constants/index.ts`
- Shared UI: `src/components/ui/*`

Rules:

- No hardcoded color hex in feature/screen code.
- No repeated raw spacing values when tokens exist.
- Extend shared components rather than cloning custom variants.

## Type System Rules

- No `any`.
- No raw `string` IDs in domain models.
- Use branded types for entity IDs.
- Use enums or literal unions for categorical values.
- Validate DB/API payloads before mapping to domain types.

Example:

```ts
export type SpotId = string & { readonly brand: unique symbol };

export enum JourneyStatus {
  InProgress = 'InProgress',
  Completed = 'Completed',
  Abandoned = 'Abandoned',
}
```

## File Size and Responsibility

Targets:

- Screen file: <= 300 lines (hard max 400)
- Reusable component: <= 150 lines
- Function: <= 30 lines where practical

When a screen grows:

1. Extract render layer components.
2. Extract flow hooks (search, map interactions, journey session, sheets).
3. Keep screen mostly as data wiring.

## Data and Architecture Boundaries

- `screens`: compose, do not implement domain logic.
- `components`: presentation only.
- `hooks`: orchestration and side-effects.
- `services/repositories`: business rules + external I/O + parsing.
- `types`: domain contracts (branded IDs, enums, DTOs).

## Code Review Checklist

- [ ] No magic string/number introduced
- [ ] No raw domain `string` where constrained type exists
- [ ] Existing library/component reused where possible
- [ ] File complexity reduced or stable
- [ ] Lint and type-check pass
- [ ] Logging and user-facing error handling are present

## Quality Gates

Run before finalizing any implementation:

```bash
pnpm lint
pnpm type-check
```

