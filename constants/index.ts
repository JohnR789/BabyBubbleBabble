/**
 * Application-wide constants: routes, scene metadata and UX tunables.
 */

export const ROUTES = {
  Home: 'Home',
  PouringScene: 'PouringScene',
  ColorSortScene: 'ColorSortScene',
  SoundMatchScene: 'SoundMatchScene',
  LetterGardenScene: 'LetterGardenScene',
  CountingScene: 'CountingScene',
  FlowerArrangeScene: 'FlowerArrangeScene',
  ButtonFrameScene: 'ButtonFrameScene',
  PuzzleMapScene: 'PuzzleMapScene',
  ShapeTraceScene: 'ShapeTraceScene',
  SpoonTransferScene: 'SpoonTransferScene',
  ParentalArea: 'ParentalArea',
} as const;

export type RouteName = keyof typeof ROUTES;

export const SCENES = [
  { route: ROUTES.PouringScene, label: 'Pouring', icon: '🫗', premium: false },
  { route: ROUTES.ColorSortScene, label: 'Color Sort', icon: '🎨', premium: false },
  { route: ROUTES.SoundMatchScene, label: 'Sound Match', icon: '🔔', premium: false },
  { route: ROUTES.LetterGardenScene, label: 'Letter Garden', icon: '🔤', premium: false },
  { route: ROUTES.CountingScene, label: 'Counting', icon: '🔢', premium: false },
  { route: ROUTES.FlowerArrangeScene, label: 'Flower Arrange', icon: '🌸', premium: true },
  { route: ROUTES.ButtonFrameScene, label: 'Button Frame', icon: '🧵', premium: true },
  { route: ROUTES.PuzzleMapScene, label: 'Puzzle Map', icon: '🌍', premium: true },
  { route: ROUTES.ShapeTraceScene, label: 'Shape Trace', icon: '✏️', premium: true },
  { route: ROUTES.SpoonTransferScene, label: 'Spoon Transfer', icon: '🥄', premium: true },
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
