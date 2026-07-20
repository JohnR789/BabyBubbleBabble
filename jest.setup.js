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
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}), { virtual: true });

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const insets = { top: 0, bottom: 0, left: 0, right: 0 };
  const SafeAreaInsetsContext = React.createContext(insets);
  const SafeAreaFrameContext = React.createContext({ x: 0, y: 0, width: 800, height: 600 });
  return {
    __esModule: true,
    SafeAreaProvider: ({ children }) => React.createElement(SafeAreaInsetsContext.Provider, { value: insets }, children),
    SafeAreaView: ({ children, style }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 800, height: 600 }),
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
  };
});

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const fakeNav = { navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() };
  const NavigationContext = React.createContext(fakeNav);
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    NavigationContainer: ({ children }) => React.createElement(NavigationContext.Provider, { value: fakeNav }, children),
    useNavigation: () => fakeNav,
    useRoute: () => ({ name: 'Home', params: {} }),
  };
});

jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  const fakeNav = { navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() };
  return {
    createStackNavigator: () => ({
      Navigator: ({ children }) => children,
      Screen: ({ component: Component, initialParams }) =>
        React.createElement(Component, { navigation: fakeNav, route: { params: initialParams ?? {} } }),
    }),
  };
});
