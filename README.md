# Hitch-It 🚗

> Your hitchhiking companion for discovering the best spots, planning routes, and tracking your journeys across France and beyond.

## What is Hitch-It?

**Hitch-It** is a mobile app designed specifically for the hitchhiking community. Born from real hitchhiking experiences, it solves the age-old problem: _"Where should I position myself to catch a ride?"_

Whether you're a seasoned hitchhiker or planning your first adventure, Hitch-It helps you:

- **Find proven spots** - Discover where other hitchhikers have successfully caught rides
- **Plan your journey** - Search destinations, view routes, and navigate to optimal hitchhiking positions
- **Record your trips** - Track your hitchhiking adventures automatically with journey recording
- **Share knowledge** - Contribute spots and help grow the community's collective wisdom

Built for French hitchhikers, with a focus on simplicity and real-world usability.

## Current Features

### ✅ Spot Management

Save and discover hitchhiking spots with ratings, notes, and success stories. Mark your favorite spots and access them offline.

### ✅ Journey Recording

Automatically track your hitchhiking trips with background location tracking. Record pickup points, wait times, and journey details.

### ✅ Map Search & Navigation

Search destinations, view routes on the map, and get directions to the best hitchhiking spots along your way.

### ✅ Find the best spot on the driver's path

Compare your itinerary with the driver path and find the latest spot you have on both path.

## Vision

Hitch-It aims to become **the essential tool for hitchhikers**, combining:

- Community-driven spot knowledge
- Smart route planning and navigation
- Comprehensive journey tracking and statistics
- Photo documentation of spots
- Safety features like destination sharing

All while maintaining **privacy**, **offline-first capability**, and **simplicity**.

---

## Getting Started

### For Users

Hitch-It is currently in active development. The app will soon be available on iOS and Android app stores.

### For Developers

Want to contribute or run the project locally? Here's how to get started.

#### Prerequisites

- Node.js >= 18.0.0
- [pnpm](https://pnpm.io/) package manager
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (macOS only) or Android Studio

#### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd hitch-it

# Install dependencies
pnpm install

# Start the development server
pnpm start
```

Then press:

- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

#### Development Commands

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `pnpm start`      | Start Metro bundler           |
| `pnpm ios`        | Run on iOS simulator          |
| `pnpm android`    | Run on Android emulator       |
| `pnpm lint`       | Check code quality with Biome |
| `pnpm lint:fix`   | Auto-fix linting issues       |
| `pnpm type-check` | Run TypeScript type checking  |

---

## Architecture & Tech Stack

Hitch-It follows a **feature-based clean architecture** using Domain-Driven Design (DDD) principles.

### Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript (strict mode)
- **Backend**: Supabase (PostgreSQL with Row Level Security)
- **Maps**: React Native Maps
- **Navigation**: React Navigation
- **State**: React Context + Hooks
- **Code Quality**: Biome (linting + formatting)

### Project Structure

```
src/
├── spot/              # Spot management (feature module)
├── journey/           # Journey recording (feature module)
├── screens/           # Screen components
├── components/        # Shared UI components
├── hooks/             # Custom hooks
├── lib/               # External integrations (Supabase)
├── constants/         # Design tokens, config
├── utils/             # Utilities + logger
└── types/             # Shared TypeScript types
```

Each feature module is self-contained with its own:

- Components
- Services
- Context & hooks
- Type definitions

### Code Quality Standards

- **Zero tolerance** for `any` types
- **Library-first** approach - prefer established solutions over custom code
- **Design system** - all UI uses shared tokens and components
- **Small, focused files** - screens ≤ 300 lines, components ≤ 150 lines
- **Domain types** - branded IDs, enums for categorical values

See [docs/ENGINEERING_STANDARDS.md](docs/ENGINEERING_STANDARDS.md) for complete guidelines.

---

## Contributing

Hitch-It is currently a solo project, but contributions are welcome! Here's how you can help:

### Before You Start

1. Read [CLAUDE.md](CLAUDE.md) - Project philosophy and development guidelines
2. Check [docs/ROADMAP.md](docs/ROADMAP.md) - See what's planned and in progress
3. Review [docs/ENGINEERING_STANDARDS.md](docs/ENGINEERING_STANDARDS.md) - Code standards

### Development Workflow

1. **Pick or propose a feature** from the roadmap
2. **Create a feature spec** (see `docs/features/` for examples)
3. **Develop** following the engineering standards
4. **Test** - Run `pnpm lint` and `pnpm type-check`
5. **Submit a PR** with clear description

### Quality Checklist

Before submitting:

- [ ] Code passes `pnpm lint` and `pnpm type-check`
- [ ] No hardcoded strings/colors - uses constants and design tokens
- [ ] Reuses existing components and libraries where possible
- [ ] Files stay within size limits (screens ≤ 300 lines)
- [ ] Proper TypeScript types (no `any`, branded IDs for entities)

### Philosophy

> "A good developer is the one who removes lines of code"

We prefer:

- Simple, direct solutions over clever abstractions
- Library solutions over custom implementations
- Explicit code over magic behavior
- Deleting code over adding features

See [CLAUDE.md](CLAUDE.md) for the full philosophy.

---

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Quick reference for development standards and commands
- **[docs/ROADMAP.md](docs/ROADMAP.md)** - Feature roadmap and progress tracking
- **[docs/ENGINEERING_STANDARDS.md](docs/ENGINEERING_STANDARDS.md)** - Complete code standards and architecture guide
- **[AGENTS.md](AGENTS.md)** - Technical documentation for AI-assisted development

---

## Project Status

**Development Stage**: Active development (Alpha)

This is a solo project maintained with a focus on code quality, simplicity, and long-term maintainability.

### Recent Updates

- ✅ Journey recording with background location tracking
- ✅ Map search and route visualization
- ✅ Spot management with offline support
- ✅ Navigation integration in progress

See [docs/ROADMAP.md](docs/ROADMAP.md) for the complete feature timeline.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Questions or Feedback?

- Open an issue on GitHub
- Check the documentation in the `docs/` folder
- Review existing feature specs in `docs/features/`

**Happy hitchhiking!** 🚗✨
