# Hitch It 🚗

A modern React Native app for hitchhiking built with Expo and TypeScript.

## Features

- 🗺️ Interactive maps with React Native Maps
- 📍 Location services integration
- 🎯 Draggable markers
- 📱 Cross-platform (iOS, Android, Web)
- 🎨 Modern UI with TypeScript
- 🔧 ESLint and Prettier configured
- 📦 Well-structured codebase

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hitch-it
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

## Development

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── MapView.tsx     # Custom map component
│   └── index.ts        # Component exports
├── screens/            # Screen components
│   ├── HomeScreen.tsx  # Main home screen
│   └── index.ts        # Screen exports
├── utils/              # Utility functions
│   ├── location.ts     # Location-related utilities
│   └── index.ts        # Utility exports
├── types/              # TypeScript type definitions
│   └── index.ts        # Type exports
├── constants/          # App constants and configuration
│   └── index.ts        # Constant exports
└── navigation/         # Navigation configuration
```

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Path aliases** for clean imports

### Path Aliases

Configured path aliases for cleaner imports:
- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@screens/*` → `./src/screens/*`
- `@utils/*` → `./src/utils/*`
- `@types/*` → `./src/types/*`
- `@constants/*` → `./src/constants/*`

## Configuration

### Environment Setup

1. **iOS Development**
   - Install Xcode
   - Install iOS Simulator
   - Configure bundle identifier in `app.json`

2. **Android Development**
   - Install Android Studio
   - Configure Android SDK
   - Set up Android emulator or connect device

3. **Location Services**
   - iOS: Add location permissions in `app.json`
   - Android: Location permissions are configured automatically

### App Configuration

Update `app.json` with your project details:
- Change `slug` to your app slug
- Update `bundleIdentifier` for iOS
- Update `package` for Android
- Add your EAS project ID

## Building for Production

### Using EAS Build

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

4. **Build for platforms**
   ```bash
   # Android
   eas build --platform android
   
   # iOS
   eas build --platform ios
   
   # Both platforms
   eas build --platform all
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you have any questions or need help, please open an issue in the repository.
