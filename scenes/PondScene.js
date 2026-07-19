import React, { useCallback, useRef, useState } from 'react';
import { View, TouchableWithoutFeedback, Image, StyleSheet } from 'react-native';
import SceneShell from '../components/SceneShell';
import { playPopSound } from '../utils/SoundManager';
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
    playPopSound();
    timeoutRef.current = setTimeout(() => {
      setFrog(null);
    }, 1200);
  }, []);

  return (
    <SceneShell backgroundColor={COLORS.pond} safeArea={false}>
      <TouchableWithoutFeedback onPress={handleTouch}>
        <View style={styles.stage}>
          {frog && (
            <Image
              source={IMAGES.animals.frog}
              style={[styles.frog, { left: frog.x, top: frog.y }]}
              accessibilityLabel="Frog"
            />
          )}
        </View>
      </TouchableWithoutFeedback>
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
