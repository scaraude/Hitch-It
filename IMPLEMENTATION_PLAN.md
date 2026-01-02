# Hitch-It Implementation Plan

> Generated from senior mobile dev audit + React Native MCP analysis
> Date: January 2026

---

## Overview

This plan addresses **59 identified issues** across performance, accessibility, code quality, and testing. Items are prioritized by impact and effort.

---

## Phase 1: Tooling Migration (Biome)

**Goal**: Replace ESLint + Prettier with Biome for faster, unified linting/formatting.

### 1.1 Remove Current Tooling

```bash
pnpm remove eslint prettier eslint-config-expo eslint-config-prettier \
  eslint-plugin-react eslint-plugin-react-hooks \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  @eslint/compat @eslint/eslintrc @eslint/js
```

### 1.2 Delete Config Files

- [ ] Delete `.prettierrc`
- [ ] Delete `eslint.config.mjs`

### 1.3 Install Biome

```bash
pnpm add -D @biomejs/biome
npx @biomejs/biome init
```

### 1.4 Create `biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "useExhaustiveDependencies": "warn",
        "useHookAtTopLevel": "error"
      },
      "suspicious": {
        "noExplicitAny": "error"
      },
      "style": {
        "noUnusedTemplateLiteral": "warn"
      }
    }
  },
  "javascript": {
    "formatter": {
      "semicolons": "always",
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "arrowParentheses": "asNeeded"
    }
  },
  "files": {
    "ignore": ["node_modules", ".expo", "dist", "android", "ios"]
  }
}
```

### 1.5 Update `package.json` Scripts

```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write ."
  }
}
```

### 1.6 Run Initial Format

```bash
pnpm lint:fix
pnpm format
```

---

## Phase 2: Performance Optimizations

**Goal**: Fix critical performance issues identified by MCP analysis.

### 2.1 Replace ScrollView + .map() with FlatList

**Files affected**:

- `src/spot/components/SpotDetailsSheet.tsx` (destinations list)
- `src/spot/components/SpotForm.tsx` (destinations list)

**Pattern to apply**:

```tsx
// Before (anti-pattern)
<ScrollView>
  {items.map((item, index) => (
    <Item key={index} data={item} />
  ))}
</ScrollView>

// After (optimized)
<FlatList
  data={items}
  keyExtractor={(item, index) => item.id ?? index.toString()}
  renderItem={({ item }) => <Item data={item} />}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### 2.2 Memoize List Item Components

- [ ] Wrap `DestinationChip` with `React.memo()`
- [ ] Wrap `SpotMarker` rendering with `React.memo()` if extracted

### 2.3 Extract Magic Numbers to Constants

**Files affected**: 7 files

Create `src/constants/sizes.ts`:

```typescript
export const SIZES = {
  // Border radius
  radiusSmall: 4,
  radiusMedium: 8,
  radiusLarge: 16,
  radiusXLarge: 20,
  radiusRound: 9999,

  // Font sizes
  fontXs: 12,
  fontSm: 14,
  fontMd: 16,
  fontLg: 18,
  fontXl: 20,
  font2Xl: 24,
  font3Xl: 28,

  // Icon sizes
  iconSm: 18,
  iconMd: 24,
  iconLg: 32,

  // Component sizes
  buttonHeight: 48,
  inputHeight: 44,
  fabSize: 56,
  dragHandleWidth: 40,
  dragHandleHeight: 4,

  // Shadows
  shadowRadius: 8,
  shadowOpacity: 0.1,
} as const;
```

---

## Phase 3: Accessibility Improvements

**Goal**: Fix 17 accessibility issues for inclusive UX.

### 3.1 Add accessibilityLabel to Interactive Elements

**Files affected**:

- `FloatingButton.tsx`
- `SpotDetailsSheet.tsx`
- `SpotForm.tsx`
- `DestinationChip.tsx`
- `DestinationInput.tsx`

**Pattern**:

```tsx
// Before
<TouchableOpacity onPress={onPress}>
  <Text>+</Text>
</TouchableOpacity>

// After
<TouchableOpacity
  onPress={onPress}
  accessibilityLabel="Ajouter un spot"
  accessibilityRole="button"
  accessibilityHint="Appuyez pour créer un nouveau spot"
>
  <Text>+</Text>
</TouchableOpacity>
```

### 3.2 Add accessibilityRole to All Buttons

| Component                    | Role                                       |
| ---------------------------- | ------------------------------------------ |
| `TouchableOpacity` (buttons) | `"button"`                                 |
| `TextInput`                  | `"text"` (default)                         |
| `ScrollView`                 | `"scrollview"`                             |
| Close buttons                | `"button"` + `accessibilityLabel="Fermer"` |

### 3.3 Support Font Scaling

For critical text that must scale:

```tsx
<Text allowFontScaling={true} maxFontSizeMultiplier={1.5}>
  Important text
</Text>
```

### 3.4 Create Accessibility Constants

Create `src/constants/accessibility.ts`:

```typescript
export const A11Y_LABELS = {
  // Buttons
  closeButton: "Fermer",
  addSpot: "Ajouter un spot",
  confirmSpot: "Confirmer le spot",
  cancelAction: "Annuler",
  openMap: "Ouvrir dans l'application Cartes",
  getDirections: "Obtenir l'itinéraire",
  addComment: "Ajouter un commentaire",
  removeDestination: "Supprimer la destination",

  // Hints
  addSpotHint: "Appuyez pour commencer à placer un nouveau spot",
  mapHint: "Carte interactive des spots de stop",
} as const;
```

---

## Phase 4: Testing Infrastructure

**Goal**: Set up lean, effective testing with Jest + React Testing Library.

### 4.1 Install Testing Dependencies

```bash
pnpm add -D jest @testing-library/react-native \
  @testing-library/jest-native jest-expo \
  @types/jest
```

### 4.2 Configure Jest

Create `jest.config.js`:

```javascript
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@screens/(.*)$": "<rootDir>/src/screens/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### 4.3 Add testID Props to Components

**Priority components**:

| Component          | testID                                              |
| ------------------ | --------------------------------------------------- |
| `FloatingButton`   | `floating-button-{position}`                        |
| `SpotForm`         | `spot-form`, `spot-form-submit`, `spot-form-cancel` |
| `SpotDetailsSheet` | `spot-details-sheet`, `spot-details-close`          |
| `DestinationInput` | `destination-input`, `destination-add-button`       |
| `DestinationChip`  | `destination-chip-{index}`                          |
| `MapView`          | `map-view`                                          |

### 4.4 Create Test Files

**Start with critical paths** (add more as needed):

```
src/
├── hooks/
│   └── __tests__/
│       ├── useSpots.test.ts       # Priority 1: Core business logic
│       └── useLocation.test.ts    # Priority 2: Location handling
└── spot/
    └── components/
        └── __tests__/
            ├── SpotForm.test.tsx           # Priority 1: Critical user flow
            ├── SpotDetailsSheet.test.tsx   # Priority 2: Data display
            └── ui/
                ├── DestinationInput.test.tsx  # Priority 3: Complex input
                └── DestinationChip.test.tsx   # Priority 3: Simple component
```

**Focus areas:**

- Business logic (hooks)
- Critical user flows (form submission)
- Complex components (inputs with state)

### 4.5 Add Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Phase 5: Code Quality & Refactoring

**Goal**: Reduce prop drilling and improve maintainability.

### 5.1 Create SpotContext for State Management

**Problem**: `HomeScreen` passes many props down through multiple levels.

Create `src/spot/context/SpotContext.tsx`:

```typescript
import React, { createContext, useContext, ReactNode } from "react";
import { useSpots, UseSpotsReturn } from "../hooks/useSpots";

const SpotContext = createContext<UseSpotsReturn | null>(null);

export const SpotProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const spotsState = useSpots();
  return (
    <SpotContext.Provider value={spotsState}>{children}</SpotContext.Provider>
  );
};

export const useSpotContext = (): UseSpotsReturn => {
  const context = useContext(SpotContext);
  if (!context) {
    throw new Error("useSpotContext must be used within SpotProvider");
  }
  return context;
};
```

### 5.2 Consider Zustand for Future Scaling

If state complexity grows, migrate to Zustand:

```bash
pnpm add zustand
```

```typescript
// src/spot/store/spotStore.ts
import { create } from "zustand";

interface SpotState {
  spots: Spot[];
  selectedSpot: Spot | null;
  isPlacingSpot: boolean;
  // ... actions
}

export const useSpotStore = create<SpotState>((set) => ({
  spots: [],
  selectedSpot: null,
  isPlacingSpot: false,
  // ... action implementations
}));
```

### 5.3 Add Error Boundaries

Create `src/components/ErrorBoundary.tsx`:

```typescript
import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    // TODO: Send to error reporting service
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <View style={styles.container}>
            <Text style={styles.title}>Oups ! Une erreur est survenue</Text>
            <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
              <Text style={styles.buttonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )
      );
    }
    return this.props.children;
  }
}
```

---

## Phase 6: Navigation Setup

**Goal**: Implement proper navigation stack (libraries already installed).

### 6.1 Create Navigation Structure

```
src/
└── navigation/
    ├── RootNavigator.tsx
    ├── types.ts
    └── index.ts
```

### 6.2 Implement RootNavigator

```typescript
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { HomeScreen } from "@screens";
import { RootStackParamList } from "./types";

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* Future screens */}
      {/* <Stack.Screen name="SpotDetails" component={SpotDetailsScreen} /> */}
      {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
    </Stack.Navigator>
  </NavigationContainer>
);
```

---

## Phase 7: Database Integration

**Goal**: Integrate SQLite for offline persistence (package already installed).

### 7.1 Create Database Service

```
src/
└── spot/
    └── services/
        ├── database.ts      # SQLite connection
        ├── spotRepository.ts # CRUD operations
        └── index.ts
```

### 7.2 Define Schema

```typescript
// src/spot/services/database.ts
const SPOT_SCHEMA = `
  CREATE TABLE IF NOT EXISTS spots (
    id TEXT PRIMARY KEY,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    road_name TEXT NOT NULL,
    appreciation TEXT NOT NULL,
    direction TEXT NOT NULL,
    destinations TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT NOT NULL
  );
`;
```

---

## Phase 8: Future Enhancements

### 8.1 Comments Feature

- [ ] Create `Comment` type with `text`, `appreciation`, `markedAsDangerous`
- [ ] Add `comments` array to `Spot` type
- [ ] Create `CommentForm` component
- [ ] Create `CommentList` component
- [ ] Add comment CRUD to `useSpots` hook

### 8.2 User Authentication

- [ ] Add authentication service
- [ ] Replace hardcoded `createdBy: 'CurrentUser'`
- [ ] Add user profile screen

### 8.3 Offline Sync

- [ ] Queue operations when offline
- [ ] Sync when connection restored
- [ ] Show sync status indicator

---

## Implementation Checklist

### Phase 1: Tooling Migration ✅ COMPLETED

- [x] Remove ESLint/Prettier packages
- [x] Delete config files
- [x] Install Biome
- [x] Create biome.json
- [x] Update package.json scripts
- [x] Run initial format
- [x] Fix all linting warnings (useCallback, array keys, import types, isNaN)

### Phase 2: Performance ✅ COMPLETED

- [x] ~~Replace ScrollView+map with FlatList in SpotDetailsSheet~~ (N/A - destinations use flexWrap in View, not ScrollView+map pattern)
- [x] ~~Replace ScrollView+map with FlatList in SpotForm~~ (N/A - destinations use flexWrap in View, not ScrollView+map pattern)
- [x] Memoize DestinationChip
- [x] Extract magic numbers to SIZES constant (applied to 7 files: SpotDetailsSheet, SpotForm, DestinationChip, DestinationInput, FloatingButton, Header)

### Phase 3: Accessibility ✅ COMPLETED

- [x] Add accessibilityLabel to FloatingButton
- [x] Add accessibilityLabel to SpotDetailsSheet buttons
- [x] Add accessibilityLabel to SpotForm buttons
- [x] Add accessibilityLabel to DestinationChip
- [x] Add accessibilityLabel to DestinationInput
- [x] Add accessibilityRole to all TouchableOpacity
- [x] Create A11Y_LABELS constants

### Phase 4: Testing ✅ COMPLETED (testID props only)

- [x] Add testID to components for future testing/E2E:
  - FloatingButton: `floating-button-{position}`
  - SpotForm: `spot-form`, `spot-form-submit`, `spot-form-cancel`, `spot-form-road-name`
  - SpotDetailsSheet: `spot-details-sheet`, `spot-details-close`
  - DestinationInput: `destination-input`, `destination-add-button`
  - DestinationChip: `destination-chip-{destination}`
  - MapView: `map-view`

**Note**: Unit testing skipped due to React Native 0.81 + Jest 30 ESM compatibility issues. Components are now test-ready with testID props for future E2E testing with Detox or Maestro.

### Phase 5: Code Quality ✅ COMPLETED

- [x] Create SpotContext
- [x] Wrap App with SpotProvider
- [x] Refactor HomeScreen to use context
- [x] Add ErrorBoundary component
- [x] Wrap App with ErrorBoundary

### Phase 6: Navigation

- [ ] Create navigation folder structure
- [ ] Implement RootNavigator
- [ ] Update App.tsx to use navigator

### Phase 7: Database

- [ ] Create database service
- [ ] Create spotRepository
- [ ] Migrate useSpots to use repository
- [ ] Add migration system

---

## Priority Order

| Priority  | Phase                    | Effort | Impact                   |
| --------- | ------------------------ | ------ | ------------------------ |
| 🔴 High   | Phase 1: Biome Migration | Low    | High (DX)                |
| 🔴 High   | Phase 2: Performance     | Medium | High (UX)                |
| 🟠 Medium | Phase 3: Accessibility   | Medium | High (Inclusivity)       |
| 🟠 Medium | Phase 4: Testing         | High   | High (Reliability)       |
| 🟡 Low    | Phase 5: Code Quality    | Medium | Medium (Maintainability) |
| 🟡 Low    | Phase 6: Navigation      | Low    | Medium (Scalability)     |
| 🟢 Future | Phase 7: Database        | High   | High (Functionality)     |
| 🟢 Future | Phase 8: Enhancements    | High   | High (Features)          |

---

## Resources

- [Biome Documentation](https://biomejs.dev/guides/getting-started/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [FlatList Performance](https://reactnative.dev/docs/optimizing-flatlist-configuration)
- [Zustand State Management](https://github.com/pmndrs/zustand)
