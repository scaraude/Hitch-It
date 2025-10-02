# Claude Code Configuration

## Project Commands

### Product spec
- the app is for french people and french territory

### Package manager
project package manager: 
```
yarn
```

### Development
```bash
# Start Metro bundler
yarn start

# Run on specific platforms
yarn ios
yarn android
yarn web
```

### Code Quality
```bash
# Lint code
yarn lint

# TypeScript check
npx tsc --noEmit
```

### Android Setup
- **Android Studio** required for emulator
- **ANDROID_HOME**: `$HOME/Library/Android/sdk`
- **AVD**: Use Android Studio AVD Manager to create/manage emulators

## Project Structure

Feature-based architecture following DDD principles:

```
src/
├── components/        # Shared UI components
│   ├── ui/           # Basic UI components (Header, LoadingSpinner, Toast, FloatingButton, etc.)
│   └── MapView.tsx   # Map component
├── hooks/            # Shared custom React hooks
│   └── useLocation.ts # Location management
├── screens/          # Screen components
├── spot/             # Spot feature module (DDD)
│   ├── components/   # Spot-specific components (CreateSpotButton, etc.)
│   ├── hooks/        # Spot-specific hooks (useSpots, etc.)
│   ├── types.ts      # Spot domain types
│   └── index.ts      # Feature exports
├── types/            # Shared TypeScript type definitions
├── constants/        # App constants (colors, spacing, etc.)
└── utils/            # Utility functions
```

## Architecture Notes

- **DDD (Domain-Driven Design)**: Features organized in dedicated modules
- **Feature-based structure**: Each feature (e.g., `spot/`) contains its own components, hooks, and types
- **Custom hooks** for business logic separation
- **UI components** are reusable and composable
- **TypeScript** for type safety
- **Expo** for React Native development

## Clean Code Rules

### General Principles
- **KISS** (Keep It Simple, Stupid): Favor simplicity over complexity
- **DRY** (Don't Repeat Yourself): Avoid code duplication
- **SOLID** principles:
  - **S**ingle Responsibility: Each module/function has one clear purpose
  - **O**pen/Closed: Open for extension, closed for modification
  - **L**iskov Substitution: Subtypes must be substitutable for their base types
  - **I**nterface Segregation: Prefer specific interfaces over general ones
  - **D**ependency Inversion: Depend on abstractions, not concretions

### Code Standards
- Use **descriptive names** for variables, functions, and components
- Keep **functions small** and focused on a single task
- **Extract reusable logic** into custom hooks or utility functions
- Use **TypeScript** types consistently - avoid `any`
- Prefer **composition** over inheritance
- Write **self-documenting code** - code should explain itself
- Add comments only when **business logic is complex** or non-obvious
- Use **barrel exports** (`index.ts`) for clean imports
- Follow **React Native best practices** for performance

## Domain struct

- **spots**: spots will have {appreciation: "perfect" | "good" | "bad", roadName: string, direction: "North" | "North-East" | "East"..., destinations: string[], comments: Comment[] } + { createdAt, updatedAt, createdBy, etc }
- **comment**: {text: string, appreciation: Appreciation, markedAsDangerous: bool} + {createdAt, updatedAt, autor, etc}