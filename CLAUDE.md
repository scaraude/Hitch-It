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

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Basic UI components (Header, LoadingSpinner, etc.)
│   └── MapView.tsx   # Map component
├── hooks/            # Custom React hooks
│   ├── useLocation.ts # Location management
│   └── useMarkers.ts  # Marker management
├── screens/          # Screen components
├── types/            # TypeScript type definitions
├── constants/        # App constants (colors, spacing, etc.)
└── utils/            # Utility functions
```

## Architecture Notes

- **Custom hooks** for business logic separation
- **UI components** are reusable and composable
- **TypeScript** for type safety
- **Expo** for React Native development

## Domain struct

- **spots**: spots will have {appreciation: "perfect" | "good" | "bad", roadName: string, direction: "North" | "North-East" | "East"..., destinations: string[], comments: Comment[] } + { createdAt, updatedAt, createdBy, etc }
- **comment**: {text: string, appreciation: Appreciation, markedAsDangerous: bool} + {createdAt, updatedAt, autor, etc}