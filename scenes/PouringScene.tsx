import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import SceneShell from '../components/SceneShell';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { IMAGES } from '../assets';
import { playPop, playSuccess, playWaterPour } from '../utils/SoundManager';
import { speak } from '../utils/speech';
import { lightImpact } from '../utils/haptics';

export default function PouringScene() {
  const { width } = useWindowDimensions();
  const [fill, setFill] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const imageSize = Math.min(width * 0.7, 260);

  const startPour = () => {
    if (done) return;
    lightImpact();
    playWaterPour().catch(() => {});
    intervalRef.current = setInterval(() => {
      setFill((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current as ReturnType<typeof setInterval>);
          if (!done) {
            setDone(true);
            playSuccess();
            speak('You poured the water!');
          }
          return 100;
        }
        return prev + 2;
      });
    }, 40);
  };

  const stopPour = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    stopPour();
    setFill(0);
    setDone(false);
    playPop();
  };

  return (
    <SceneShell backgroundColor={COLORS.pastels[0]} safeArea={false}>
      <View style={styles.stage}>
        <Text style={styles.prompt}>Hold the pitcher to pour</Text>

        <Pressable
          onPressIn={startPour}
          onPressOut={stopPour}
          accessibilityRole="button"
          accessibilityLabel="Pour pitcher"
          accessibilityHint="Press and hold to pour water"
          style={styles.pitcherWrap}
        >
          <Image
            source={IMAGES.scenes.pouring}
            style={[styles.image, { width: imageSize, height: imageSize }]}
            resizeMode="contain"
          />
        </Pressable>

        <View style={styles.cup}>
          <View style={[styles.water, { height: `${fill}%` }]} />
        </View>

        {done ? (
          <Text style={styles.celebrate}>All poured!</Text>
        ) : null}

        <Pressable
          onPress={reset}
          style={styles.reset}
          accessibilityRole="button"
          accessibilityLabel="Reset pouring"
        >
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>
    </SceneShell>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  prompt: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  pitcherWrap: {
    marginBottom: SPACING.xl,
  },
  image: {
    borderRadius: RADIUS.xl,
  },
  cup: {
    width: 120,
    height: 120,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  water: {
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  celebrate: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.sizes.h1,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success,
  },
  reset: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  resetText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
});
