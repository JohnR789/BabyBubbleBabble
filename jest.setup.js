/* Jest setup: mock native modules that have no JS implementation under Node. */

require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

// expo-audio relies on native modules unavailable in Jest.
jest.mock('expo-audio', () => {
  const createMockPlayer = () => ({
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    seekTo: jest.fn(async () => {}),
    remove: jest.fn(),
    loop: false,
    volume: 1,
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  });

  const defaultPlayer = createMockPlayer();

  return {
    __esModule: true,
    useAudioPlayer: jest.fn(() => defaultPlayer),
    createAudioPlayer: jest.fn(() => createMockPlayer()),
    useAudioPlayerStatus: jest.fn(() => ({ didJustFinish: false, playing: false, isLoaded: true })),
    setAudioModeAsync: jest.fn(async () => {}),
  };
});

// AsyncStorage has no native module under Node; mock it so settings load instantly.
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
  },
}));

// Optional native add-ons that scenes load defensively; keep them quiet in tests.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(async () => {}),
  ImpactFeedbackStyle: { Light: 'light' },
}), { virtual: true });
jest.mock('expo-sensors', () => ({ Accelerometer: { addListener: () => ({ remove() {} }), setUpdateInterval: () => {} } }), { virtual: true });
