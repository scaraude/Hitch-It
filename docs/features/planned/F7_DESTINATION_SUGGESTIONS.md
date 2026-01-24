# Feature 7: Dynamic Destination Suggestions ("Objectif")

**Status**: 📋 **PLANNED**

**Goal**: Suggest destination "themes" based on direction, not just city names.

---

## 7.1 Concept

When hitchhiker is at a spot for 5+ minutes, show popup:

```
Vous allez vers...
┌─────────────────────────────────┐
│ 🌊 La Côte Basque               │
│ 🌲 Les Landes                   │
│ ☀️ Le Sud                       │
│ 🏔️ Les Pyrénées                │
│ 📍 Bayonne (votre destination)  │
└─────────────────────────────────┘

"À dire au conducteur pour augmenter vos chances"
```

---

## 7.2 Data Model

```typescript
// src/destination/types.ts
interface DestinationTheme {
  id: string;
  name: string;
  emoji: string;
  region: string;
  keywords: string[]; // For search
  boundingBox: BoundingBox;
  majorCities: string[];
}

// Pre-defined themes
const THEMES: DestinationTheme[] = [
  {
    id: "cote-basque",
    name: "La Côte Basque",
    emoji: "🌊",
    region: "Nouvelle-Aquitaine",
    keywords: ["biarritz", "bayonne", "saint-jean-de-luz", "hendaye"],
    // ...
  },
  // ...
];
```

---

## 7.3 Implementation

- [ ] Create `src/destination/` feature module
- [ ] Define ~30 French destination themes
- [ ] Algorithm to suggest relevant themes based on:
  - Current location
  - User's final destination
  - Spot direction
  - Common routes from this spot

---

## 7.4 Trigger Logic

```typescript
// Show popup when:
const shouldShowObjectif = (
  timeAtSpot: number,
  hasShownRecently: boolean,
  isInNavigationMode: boolean
): boolean => {
  return (
    timeAtSpot >= 5 * 60 * 1000 && // 5 minutes
    !hasShownRecently &&
    isInNavigationMode
  );
};
```

---

## 7.5 UI

- [ ] Bottom popup with theme suggestions
- [ ] Tap to copy theme name
- [ ] "Use this" updates displayed destination
- [ ] Dismissible, remembers preference
- [ ] Settings to enable/disable

---

## Implementation Checklist

- [ ] Create `src/destination/` feature module
- [ ] Define DestinationTheme data model
- [ ] Create ~30 French destination themes data
- [ ] Implement suggestion algorithm
- [ ] Create trigger logic (time at spot detection)
- [ ] Build Objectif popup component
- [ ] Add theme copy/use functionality
- [ ] Add dismissible preference storage
- [ ] Add enable/disable settings option

---

## Estimated Effort

**0.5 week**

**Priority**: 🟠 Medium (Phase 2: High-Value Features)

**Dependencies**: None (UI-only feature)
