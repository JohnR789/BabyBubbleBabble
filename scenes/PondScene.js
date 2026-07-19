import React, { useCallback, useRef, useState } from 'react';
import { View, Pressable, Image, StyleSheet } from 'react-native';
import SceneShell from '../components/SceneShell';
import { playSplashSound } from '../utils/SoundManager';
import { lightImpact } from '../utils/haptics';
import { IMAGES } from '../assets';
import { COLORS } from '../theme';

const FROG_SIZE = 72;

export default function PondScene() {
  const [frog, setFrog] = useState(null);
  const timeoutRef = useRef(null);

  const handleTouch = useCallback((evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    clearTimeout(timeoutRef.current);
    setFrog({
      x: locationX - FROG_SIZE / 2,
      y: locationY - FROG_SIZE / 2,
    });
    playSplashSound();
    lightImpact();
    timeoutRef.current = setTimeout(() => {
      setFrog(null);
    }, 1200);
  }, []);

  return (
    <SceneShell backgroundColor={COLORS.pond} safeArea={false}>
      <Pressable onPressIn={handleTouch} style={styles.stage}>
        <View style={styles.stage}>
          {frog ? (
            <Image
              source={IMAGES.animals.frog}
              style={[styles.frog, { left: frog.x, top: frog.y }]}
              accessibilityLabel="Frog"
            />
          ) : null}
        </View>
      </Pressable>
    </SceneShell>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
  },
  frog: {
    position: 'absolute',
    width: FROG_SIZE,
    height: FROG_SIZE,
  },
});
