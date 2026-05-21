---
name: build
description: >-
  End-to-end ship workflow for a ticket. Use whenever the user types /build, or
  asks to "build", "ship", "finish", or "do" a ticket (e.g. "fais le TCK-85",
  "ship this ticket", "build BKL-12 and open the PR"). Reads the ticket AND its
  parent epic from Notion first, scopes strictly to that ticket, implements it,
  then runs the ship gate — self-satisfaction (lint + type-check + diff review),
  the code-simplifier agent, and the code-review agent — and only when all three
  pass does it commit, push, open a PR, and update the Notion ticket. Trigger this
  for any "take this ticket from code to a merge-ready PR" request, even if the
  user doesn't say the word "build".
---

# Build — ship a ticket end-to-end

Take a ticket from "not started" to "merge-ready PR + updated Notion ticket", through three quality gates the user cares about. The point of the gates is that nothing gets pushed until it is genuinely good: you are satisfied, the code is simplified, and a review pass is clean.

## When this runs

The user names a ticket (usually `TCK-XX` or `BKL-XX`) and wants it shipped. Don't ask for permission at each phase — the workflow is the directive. Do surface decisions that genuinely change scope or are irreversible.

## Phase 0 — Read the ticket and its epic (always first)

Tickets live in **Notion**, not the repo. Their IDs (`TCK-85`, `BKL-19`) are the `userDefined:ID` property on Notion pages.

1. `notion-search` for the ticket ID + title keywords, then `notion-fetch` the page.
2. Fetch the **parent epic** too (the `Epic` / `🏗️ Tickets` relation). Tickets get rescoped inside epics independently of the brand/spec docs — the epic tells you what is in *this* ticket vs. a sibling ticket.
3. **Scope strictly to this ticket.** If work seems to belong to a sibling ticket, leave it out and note it. Over-reaching across ticket boundaries makes the PR un-reviewable and steps on other tickets.

Why first: the repo's docs (brand book, specs) describe intent, but the Notion ticket is the source of truth for *current* scope. Building from docs alone leads to out-of-scope PRs.

## Phase 1 — Implement

- Follow `CLAUDE.md` (Core Rules, Design System, Type System) and `docs/ENGINEERING_STANDARDS.md`.
- Library-first; reuse shared UI/tokens; no hardcoded hex/strings; branded IDs and enums; i18n for user-facing copy.
- Keep a task list (TaskCreate) mirroring the ticket's acceptance criteria so nothing is dropped.
- Commit in focused chunks as you go (no AI signature trailer — see Conventions).

## Phase 2 — The ship gate (all three must pass)

Run these in order. Re-run after fixes until each is clean. Do not push until all three pass.

### Gate 1 — Satisfied (you)

- Lint + type-check green. Commands: `pnpm lint` and `pnpm type-check`. If `pnpm` is not on PATH, fall back to `corepack pnpm <script>` or the local binaries (`node_modules/.bin/biome check .`, `node_modules/.bin/tsc --noEmit`).
- Read your own diff end to end. Check every ticket acceptance criterion is met.
- For UI work you cannot run on a device here, say so explicitly and provide a static artifact (e.g. an HTML preview) rather than claiming visual success. See `superpowers:verification-before-completion`.

### Gate 2 — Simplify agent

Dispatch the **code-simplifier** agent (`Agent` tool, `subagent_type: code-simplifier:code-simplifier`) on the changed files. Briefing: list the files changed in this ticket, tell it to simplify for clarity/reuse/consistency while preserving behavior and respecting `CLAUDE.md`. Review its diff before keeping it — apply what genuinely improves the code, reject churn. Re-run Gate 1 after applying.

### Gate 3 — Review agent

Dispatch the **code-review** agent (`Agent` tool, `subagent_type: feature-dev:code-reviewer`, or the `/code-review` skill). Briefing: the ticket's goal + acceptance criteria, the diff/branch, and the project conventions to check against. Address high-priority findings (bugs, security, convention violations). For each piece of feedback, verify it's correct before acting — see `superpowers:receiving-code-review`. Re-run Gates 1–2 if you change code. Loop until review is clean.

## Phase 3 — Ship

Only after all three gates pass:

1. **Commit** any remaining changes (focused message, no AI signature).
2. **Push** the branch to origin (`git push -u origin <branch>`).
3. **Open the PR** with `gh pr create`: concise title (<70 chars, conventional-commit style), a Summary, a Test plan checklist, and — for UI tickets — a Screenshots section (note if device screenshots are pending). Link the ticket.
4. **Update the Notion ticket**: move its status forward (e.g. `État` → "En revue"/review), and write the PR URL into the `PR` property (`notion-update-page`, `update_properties`). Add a short comment/section noting what shipped if useful.

Report back the PR URL and the ticket link.

## Conventions (project-specific)

- **No AI signature** in commits — never add `Co-Authored-By` / "Generated with" trailers.
- **Don't commit plan docs.** Planning artifacts belong in the Notion ticket, not git. Design specs may be committed if useful.
- **Push and PR are shared-state actions** — they're authorized as the terminal step of this workflow, but never force-push to `master`.
- Default base branch for PRs is `master`.

## Pitfalls

- Skipping Phase 0's epic read → out-of-scope PR. Always check sibling tickets.
- Pushing before the gates pass → defeats the purpose; the gates are the deliverable, not the code alone.
- Treating simplify/review feedback as mandatory — verify each suggestion; reject what's wrong or churny.
- Claiming UI works without running it — provide an artifact and state the limitation instead.
