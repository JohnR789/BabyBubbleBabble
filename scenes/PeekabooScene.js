import React, { useCallback, useEffect, useState } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import Peekaboo from '../components/Peekaboo';
import SceneShell from '../components/SceneShell';
import { playGiggleSound } from '../utils/SoundManager';
import { IMAGES } from '../assets';
import { COLORS } from '../theme';

const PEEK_IMAGES = [
  IMAGES.icons.sun,
  IMAGES.icons.cloud,
  IMAGES.animals.bunny,
];

const IMAGE_SIZE = 108;

export default function PeekabooScene() {
  const { width, height } = useWindowDimensions();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % PEEK_IMAGES.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const handlePeek = useCallback(() => {
    playGiggleSound();
  }, []);

  return (
    <SceneShell backgroundColor={COLORS.peekaboo} safeArea={false}>
      <View style={styles.stage}>
        <Peekaboo
          x={Math.max(0, width / 2 - IMAGE_SIZE / 2)}
          y={Math.max(0, height / 2 - IMAGE_SIZE / 2)}
          img={PEEK_IMAGES[current]}
          onPeek={handlePeek}
        />
      </View>
    </SceneShell>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
  },
});
