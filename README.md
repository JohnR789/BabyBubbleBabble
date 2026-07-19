# Baby Bubble Babble

A gentle, offline-first sensory playground for infants and toddlers.

## Stack

- Expo SDK 54
- React Native 0.81
- TypeScript
- React Navigation
- React Native Reanimated + Gesture Handler
- expo-av for audio
- expo-iap (with safe mock fallback) for premium store integration
- AsyncStorage for parent settings and premium state

## Quick start

```sh
npm ci
npm run start          # Start the Expo dev server
```

In a separate terminal:

```sh
npm run ios            # or npm run android
```

## Validation

```sh
npm run typecheck      # TypeScript check
npm run lint           # ESLint
npm run test           # Jest tests
```

## Build verification

```sh
npx expo export -p ios --no-minify -c
npx expo export -p android --no-minify -c
```

## What's in this branch

- Central theme (`theme/`) and asset/audio registry (`assets/index.ts`, `constants/`).
- Persistent parent settings (`SettingsContext.tsx`) with music, SFX, reduced motion, and night mode toggles.
- Reusable `SceneShell` with background music, safe-area handling, and parental gate for every scene.
- Gated parent area using `ParentalLock` on the home screen.
- Premium/subscription architecture (`PremiumContext.tsx`, `services/purchase.ts`):
  - `expo-iap` integration with a built-in fallback to a mock provider for tests, Expo Go, and local preview builds.
  - Parent-only subscribe, restore, and trial controls in `ParentalArea`.
  - Scene gating: free scenes (Bubbles, Balls, Animal Parade) and premium scenes (Night Sky, Peekaboo, Pond, Stacking, Shape Sorter).
- Migrated scenes (Animal Parade, Ball, Night Sky, Peekaboo, Pond, Stacking) using the theme and asset registry.
- New Montessori-inspired `ShapeSorterScene` with drag-and-drop shape matching, gentle audio feedback, and celebration.
- App icon (`assets/icon.png`), Android adaptive icon (`assets/adaptive-icon.png`), and splash screen (`assets/splash.png`).
- Bubble Garden scene refactored to remove remote network dependencies and child-inappropriate terminology.
- Robust audio manager with SFX mute support.

## Known limitations

- The legacy Bubble Garden scene disables the inline-style lint rule while it awaits a full rewrite onto the design system.
- The purchase service falls back to a mock implementation when `expo-iap`'s native module is not available. Real store receipt validation and server-side entitlement checks should be wired up for production release.
