/**
 * Application-wide constants: routes, scene metadata and UX tunables.
 */

export const ROUTES = {
  Home: 'Home',
  BubbleScene: 'BubbleScene',
  BallScene: 'BallScene',
  AnimalParadeScene: 'AnimalParadeScene',
  NightSkyScene: 'NightSkyScene',
  PeekabooScene: 'PeekabooScene',
  PondScene: 'PondScene',
  StackingScene: 'StackingScene',
  ParentalArea: 'ParentalArea',
} as const;

export type RouteName = keyof typeof ROUTES;

export const SCENES = [
  { route: ROUTES.BubbleScene, label: 'Bubbles', icon: '🫧' },
  { route: ROUTES.BallScene, label: 'Balls', icon: '⚽' },
  { route: ROUTES.AnimalParadeScene, label: 'Animal Parade', icon: '🐄' },
  { route: ROUTES.NightSkyScene, label: 'Night Sky', icon: '🌙' },
  { route: ROUTES.PeekabooScene, label: 'Peekaboo', icon: '🫣' },
  { route: ROUTES.PondScene, label: 'Pond', icon: '🐸' },
  { route: ROUTES.StackingScene, label: 'Stacking', icon: '🧱' },
] as const;

export const PARENTAL_GATE = {
  tapsRequired: 5,
  resetMs: 2500,
} as const;

export const SETTINGS_KEYS = {
  musicOn: '@BBB/musicOn',
} as const;
