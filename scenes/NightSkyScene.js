import React, { useCallback, useEffect, useState } from 'react';
import { View, useWindowDimensions, StyleSheet, Animated } from 'react-native';
import Firefly from '../components/Firefly';
import SceneShell from '../components/SceneShell';
import { playPopSound } from '../utils/SoundManager';
import { COLORS } from '../theme';

const FIREFLY_COUNT = 7;
const FIREFLY_SIZE = 46;

function createFirefly(width, height) {
  const id = Math.random().toString(36).slice(2);
  return {
    id,
    x: new Animated.Value(Math.random() * Math.max(0, width - FIREFLY_SIZE)),
    y: new Animated.Value(Math.random() * Math.max(0, height - FIREFLY_SIZE - 80)),
    caught: false,
  };
}

export default function NightSkyScene() {
  const { width, height } = useWindowDimensions();
  const [fireflies, setFireflies] = useState([]);

  const refresh = useCallback(() => {
    if (width === 0 || height === 0) return;
    setFireflies(Array.from({ length: FIREFLY_COUNT }).map(() => createFirefly(width, height)));
  }, [width, height]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleCatch(id) {
    playPopSound();
    setFireflies((prev) =>
      prev.map((f) => (f.id === id ? { ...f, caught: true } : f)),
    );
    setTimeout(() => {
      setFireflies((prev) =>
        prev.map((f) => (f.id === id ? createFirefly(width, height) : f)),
      );
    }, 1300);
  }

  return (
    <SceneShell backgroundColor={COLORS.night} safeArea={false}>
      <View style={styles.stage}>
        {fireflies.map(
          (f) =>
            !f.caught && (
              <Firefly
                key={f.id}
                x={f.x}
                y={f.y}
                onCatch={() => handleCatch(f.id)}
              />
            ),
        )}
      </View>
    </SceneShell>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
  },
});
