/**
 * Application-wide constants: routes, scene metadata and UX tunables.
 */

export const ROUTES = {
  Home: 'Home',
  BubbleScene: 'BubbleScene',
  BallScene: 'BallScene',
  AnimalParadeScene: 'AnimalParadeScene',
  AnimalSoundsScene: 'AnimalSoundsScene',
  NightSkyScene: 'NightSkyScene',
  PeekabooScene: 'PeekabooScene',
  PondScene: 'PondScene',
  StackingScene: 'StackingScene',
  ShapeSorterScene: 'ShapeSorterScene',
  ParentalArea: 'ParentalArea',
} as const;

export type RouteName = keyof typeof ROUTES;

export const SCENES = [
  { route: ROUTES.BubbleScene, label: 'Bubbles', icon: '🫧', premium: false },
  { route: ROUTES.BallScene, label: 'Balls', icon: '⚽', premium: false },
  { route: ROUTES.AnimalParadeScene, label: 'Animal Parade', icon: '🐄', premium: false },
  { route: ROUTES.NightSkyScene, label: 'Night Sky', icon: '🌙', premium: true },
  { route: ROUTES.PeekabooScene, label: 'Peekaboo', icon: '🫣', premium: true },
  { route: ROUTES.PondScene, label: 'Pond', icon: '🐸', premium: true },
  { route: ROUTES.StackingScene, label: 'Stacking', icon: '🧱', premium: true },
  { route: ROUTES.ShapeSorterScene, label: 'Shape Sorter', icon: '🔷', premium: true },
  { route: ROUTES.AnimalSoundsScene, label: 'Animal Sounds', icon: '🔊', premium: true },
] as const;

export const PARENTAL_GATE = {
  tapsRequired: 5,
  resetMs: 2500,
} as const;

export const SETTINGS_KEYS = {
  musicOn: '@BBB/musicOn',
} as const;

export const PREMIUM_PRODUCTS = {
  monthly: 'com.babybubblebabble.premium.monthly',
  yearly: 'com.babybubblebabble.premium.yearly',
} as const;
