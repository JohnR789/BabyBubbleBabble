import React, { useCallback, useState } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import SceneShell from '../components/SceneShell';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { IMAGES } from '../assets';
import { playPlop } from '../utils/SoundManager';
import { speak } from '../utils/speech';
import { lightImpact } from '../utils/haptics';

const POM_POMS = [
  { id: 1, color: '#ff9aa2' },
  { id: 2, color: '#a0c4ff' },
  { id: 3, color: '#fdffb6' },
  { id: 4, color: '#caffbf' },
  { id: 5, color: '#e6ddff' },
];

const SIZE = 44;
const SNAP = 50;

function DraggablePom({
  pom,
  originX,
  originY,
  targetX,
  targetY,
  onDone,
}: {
  pom: (typeof POM_POMS)[number];
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  onDone: (id: number) => void;
}) {
  const x = useSharedValue(originX);
  const y = useSharedValue(originY);
  const placed = useSharedValue(false);

  const pan = Gesture.Pan()
    .enabled(!placed.value)
    .onBegin(() => {
      runOnJS(lightImpact)();
    })
    .onUpdate((event) => {
      x.value = originX + event.translationX;
      y.value = originY + event.translationY;
    })
    .onEnd(() => {
      const dx = targetX - x.value;
      const dy = targetY - y.value;
      if (Math.sqrt(dx * dx + dy * dy) < SNAP) {
        x.value = withSpring(targetX);
        y.value = withSpring(targetY);
        placed.value = true;
        runOnJS(onDone)(pom.id);
      } else {
        x.value = withSpring(originX);
        y.value = withSpring(originY);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    left: x.value,
    top: y.value,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.pom,
          { backgroundColor: pom.color },
          animatedStyle,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Pom pom ${pom.id}`}
      />
    </GestureDetector>
  );
}

export default function SpoonTransferScene() {
  const { width, height } = useWindowDimensions();
  const [moved, setMoved] = useState<Set<number>>(new Set());
  const done = moved.size === POM_POMS.length;

  const leftX = width * 0.2;
  const leftY = Math.min(height - 180, height - 80);
  const rightX = width * 0.7 - SIZE;
  const rightY = leftY;

  const originX = (i: number) => leftX - 60 + i * 40;
  const originY = leftY - 100;

  const handleDone = useCallback((id: number) => {
    setMoved((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size === POM_POMS.length) {
        // celebration handled by SceneShell
      } else {
        playPlop();
        speak('Scoop!');
      }
      return next;
    });
  }, []);

  return (
    <SceneShell backgroundColor={COLORS.pastels[4]} safeArea={false} celebrate={done} celebrationMessage="All transferred!">
      <View style={styles.stage}>
        <Image
          source={IMAGES.scenes.spoonTransfer}
          style={styles.hero}
          resizeMode="contain"
        />
        <Text style={styles.prompt}>Drag the pom-poms to the other bowl</Text>

        <View style={[styles.bowl, { left: leftX - 40, top: leftY }]} />
        <View style={[styles.bowl, { left: rightX - 40, top: rightY }]} />

        {POM_POMS.map((p, i) => (
          <DraggablePom
            key={p.id}
            pom={p}
            originX={originX(i)}
            originY={originY}
            targetX={rightX}
            targetY={rightY + (i * 10)}
            onDone={handleDone}
          />
        ))}

        {moved.size === POM_POMS.length ? (
          <Text style={styles.celebrate}>All transferred!</Text>
        ) : null}
      </View>
    </SceneShell>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    padding: SPACING.lg,
  },
  hero: {
    width: '100%',
    height: 120,
    marginBottom: SPACING.md,
  },
  prompt: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  bowl: {
    position: 'absolute',
    width: 120,
    height: 80,
    borderRadius: RADIUS.md,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  pom: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: RADIUS.full,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  celebrate: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.h1,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success,
  },
});
