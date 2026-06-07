/* Jest setup: mock native modules that have no JS implementation under Node. */

require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

// expo-av relies on the native "ExponentAV" module, which is unavailable in Jest.
jest.mock('expo-av', () => {
  class Sound {
    async loadAsync() {}
    async unloadAsync() {}
    async playAsync() {}
    async stopAsync() {}
    async pauseAsync() {}
    async replayAsync() {}
    async setPositionAsync() {}
    async setVolumeAsync() {}
    async getStatusAsync() {
      return { isLoaded: false };
    }
    setOnPlaybackStatusUpdate() {}
  }
  return {
    Audio: {
      Sound,
      setAudioModeAsync: jest.fn(async () => {}),
      INTERRUPTION_MODE_IOS_DO_NOT_MIX: 1,
    },
  };
});

// Optional native add-ons that scenes load defensively; keep them quiet in tests.
jest.mock('expo-haptics', () => ({}), { virtual: true });
jest.mock('expo-sensors', () => ({ Accelerometer: { addListener: () => ({ remove() {} }), setUpdateInterval: () => {} } }), { virtual: true });
