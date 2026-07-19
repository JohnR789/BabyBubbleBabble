/**
 * Baby Bubble Babble design tokens.
 *
 * All visual constants live here so every scene can share one cohesive,
 * premium-feeling palette, spacing scale and motion vocabulary.
 */

export const COLORS = {
  // Sky gradients
  skyDay: ['#5cb8ff', '#a9dcff', '#e7f5ff'] as const,
  skyMorning: ['#8fc9ff', '#cfe9ff', '#eef8ff'] as const,
  skyEvening: ['#ff8f5f', '#ffbe88', '#ffe8c9'] as const,
  skyNight: ['#06102a', '#0b1d3a', '#1f3a6b'] as const,

  // Surfaces
  background: '#f6f7ff',
  surface: '#ffffff',
  surfaceSoft: '#f8fafc',

  // Text
  text: '#2d2d3a',
  textMuted: '#6b7280',
  textInverse: '#ffffff',

  // Accents
  primary: '#5cb8ff',
  primaryDark: '#3aa0e8',
  accent: '#ffd24a',

  // Pastel bubble / scene tints
  pastels: ['#9bd7ff', '#ffd7f2', '#ffe1a6', '#c9ffd2', '#e6ddff'] as const,

  // Child-friendly utility
  success: '#7ee3a1',
  danger: '#ff8a8a',

  // Scene-specific backgrounds
  bubble: '#e7f5ff',
  ball: '#fff7e1',
  night: '#161831',
  peekaboo: '#edf3fa',
  pond: '#c5e6f9',
  stacking: '#fcf8e8',
  animal: '#f6f7ff',
};

export const TYPOGRAPHY = {
  sizes: {
    title: 28,
    h1: 24,
    h2: 20,
    body: 16,
    small: 14,
    tiny: 12,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const MOTION = {
  durations: {
    fast: 150,
    normal: 300,
    slow: 900,
  },
  spring: {
    friction: 5,
    tension: 120,
  },
};
