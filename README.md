# Baby Bubble Babble

A gentle, offline-first sensory playground for infants and toddlers.

## Stack

- Expo SDK 54
- React Native 0.81
- TypeScript
- React Navigation
- React Native Reanimated + Gesture Handler
- expo-av for audio
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
npm run lint           # ESLint (warnings remain in the legacy Bubble scene)
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
  - Mock store provider for safe local testing and builds.
  - Parent-only subscribe, restore, and trial controls in `ParentalArea`.
  - Scene gating: free scenes (Bubbles, Balls, Animal Parade) and premium scenes (Night Sky, Peekaboo, Pond, Stacking).
- Migrated scenes (Animal Parade, Ball, Night Sky, Peekaboo, Pond, Stacking) using the theme and asset registry.
- Bubble Garden scene refactored to remove remote network dependencies and child-inappropriate terminology.
- Robust audio manager with SFX mute support.

## Known limitations

- Bubble Garden still contains inline styles from the original implementation; they are flagged as lint warnings but do not fail the build.
- The purchase service is a mock implementation. Swapping in a real provider such as `expo-iap` or `react-native-purchases` (RevenueCat) is supported by the `PurchaseService` interface.
- Real store receipt validation and server-side entitlement checks are not wired up yet.
