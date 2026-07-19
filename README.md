# Baby Bubble Babble

A gentle, offline-first sensory playground for infants and toddlers.

## Stack

- Expo SDK 54
- React Native 0.81
- TypeScript
- React Navigation
- React Native Reanimated + Gesture Handler
- expo-av for audio
- AsyncStorage for parent settings

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
- Gated parent area using `ParentalLock` on the home screen.
- Premium home grid with pastel scene cards.
- Bubble Garden scene refactored to remove remote network dependencies and child-inappropriate terminology.
- Robust audio manager with SFX mute support.

## Known limitations

- Bubble Garden still has inline styles from the original implementation; they are flagged as lint warnings but do not fail the build.
- Some scenes (Ball, Animal Parade, Night Sky, Peekaboo, Pond, Stacking) are functional but not yet rebuilt to the new theme and asset registry.
- Premium/subscription systems, full parent dashboard insights, and new scenes are planned for follow-up work.
