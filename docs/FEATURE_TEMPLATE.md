# Feature: [Feature Name]

## 📋 Overview

[Brief description of the feature - 1-2 sentences explaining what it does and why it's valuable]

**Status**: [🔴 Not Started | 🚧 In Progress | ✅ Complete]
**Priority**: [High | Medium | Low]
**Complexity**: [Low | Medium | High]
**Dependencies**:
- [List required features with checkboxes, e.g., "✅ Journey Recording" or "❌ User Profile"]

---

## 🎯 User Story

> **As a [user type]**, I want to [action] so that [benefit].

**Flow**:
1. [Step 1 - user action]
2. [Step 2 - system response]
3. [Step 3 - next action]
...

---

## 🎨 UX/UI Specification

### Visual States

[Describe each UI state with ASCII mockups or references to design files]

#### 1. [State Name]
```
┌─────────────────────────────────────┐
│ [ASCII mockup of the UI state]     │
│                                     │
│  [Component 1]                      │
│  [Component 2]                      │
└─────────────────────────────────────┘
```

**Details**:
- [Interaction 1]
- [Visual treatment 1]
- [Animation/transition details]

[Repeat for each state]

---

## 🏗️ Technical Architecture

### Module Structure

```
src/
├── [feature-name]/              # NEW FEATURE MODULE
│   ├── components/
│   │   ├── Component1.tsx
│   │   └── Component2.tsx
│   ├── services/
│   │   └── featureService.ts
│   ├── context/
│   │   └── FeatureContext.tsx
│   ├── hooks/
│   │   └── useFeature.ts
│   ├── types.ts
│   └── index.ts
└── [existing-modules]/          # MODIFY (if needed)
```

### Data Models

```typescript
// src/[feature-name]/types.ts

export interface MainEntity {
  id: EntityId;
  // ... fields
}

// Add all relevant types, interfaces, enums
```

### Database Schema (if applicable)

```sql
CREATE TABLE IF NOT EXISTS [table_name] (
  id TEXT PRIMARY KEY,
  -- ... columns
);
```

---

## 🔧 Technical Implementation Tickets

### Ticket 1: [Ticket Name]

**File**: `path/to/file.ts`

**Goal**: [What this ticket achieves - 1 sentence]

**Implementation**:
```typescript
// Code snippets, interfaces, or pseudocode
```

**Algorithm** (if complex):
1. [Step 1]
2. [Step 2]

**Error Handling**:
- [Error case 1] → [Behavior]
- [Error case 2] → [Behavior]

**Testing**:
- [ ] Test case 1
- [ ] Test case 2

**Acceptance Criteria**:
- ✅ [Criterion 1]
- ✅ [Criterion 2]
- ✅ No `any` types
- ✅ Uses logger for errors

---

[Repeat Ticket section for each implementation task]

---

## 📦 Dependencies

### New Dependencies
- [Package name] - [Purpose] (or "None")

### External Services
- [Service name] - [What it's used for, API limits, cost]

### Environment Variables (if needed)
```env
EXPO_PUBLIC_[SERVICE]_API_KEY=
```

---

## 🚀 Implementation Phases

### Phase 1: [Phase Name]
**Goal**: [What's deliverable at end of this phase]

**Tasks**:
- [ ] Ticket 1
- [ ] Ticket 2

**Deliverable**: [What's working after this phase]

---

[Repeat for each phase]

---

## ⚠️ Known Limitations & Future Work

**Current Scope (MVP)**:
- ✅ [What we're building]
- ✅ [What we're building]

**NOT in Scope** (for later):
- ❌ [What we're NOT building now]
- ❌ [What we're NOT building now]

**Future Enhancements**:
- [Related feature or improvement for later]

---

## 📚 References

- [External API docs]
- [Library documentation]
- [Design inspiration]

---

## ✅ Acceptance Criteria (Full Feature)

- [ ] [High-level criterion 1]
- [ ] [High-level criterion 2]
- [ ] Error cases handled gracefully
- [ ] Code follows "Less Is More" philosophy
- [ ] TypeScript with no `any` types
- [ ] Biome lint passes
- [ ] No performance issues
- [ ] No `console.log` (only logger)
- [ ] No unused imports or variables

---

**Estimated Effort**: [X days/weeks] ([Y phases])

**Dependencies**:
- ✅ [Completed dependency]
- ⏳ [Pending dependency]
