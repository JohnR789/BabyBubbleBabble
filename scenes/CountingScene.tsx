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
import { playSnap } from '../utils/SoundManager';
import { speakNumber } from '../utils/speech';
import { lightImpact } from '../utils/haptics';

const COUNT = 5;
const BEAD_SIZE = 44;
const SLOT_SIZE = 54;
const SNAP = 50;

interface BeadItem {
  id: number;
  originX: number;
  originY: number;
  slotX: number;
  slotY: number;
}

function DraggableBead({
  bead,
  onDone,
}: {
  bead: BeadItem;
  onDone: (id: number) => void;
}) {
  const x = useSharedValue(bead.originX);
  const y = useSharedValue(bead.originY);
  const placed = useSharedValue(false);

  const pan = Gesture.Pan()
    .enabled(!placed.value)
    .onBegin(() => {
      runOnJS(lightImpact)();
    })
    .onUpdate((event) => {
      x.value = bead.originX + event.translationX;
      y.value = bead.originY + event.translationY;
    })
    .onEnd(() => {
      const dx = bead.slotX - x.value;
      const dy = bead.slotY - y.value;
      if (Math.sqrt(dx * dx + dy * dy) < SNAP) {
        x.value = withSpring(bead.slotX);
        y.value = withSpring(bead.slotY);
        placed.value = true;
        runOnJS(onDone)(bead.id);
      } else {
        x.value = withSpring(bead.originX);
        y.value = withSpring(bead.originY);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.bead, animatedStyle]}
        accessibilityRole="button"
        accessibilityLabel={`Bead ${bead.id}`}
      />
    </GestureDetector>
  );
}

export default function CountingScene() {
  const { width, height } = useWindowDimensions();
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  const done = placed.size === COUNT;

  const slotY = 200;
  const totalSlotWidth = COUNT * (SLOT_SIZE + 16) - 16;
  const slotStartX = (width - totalSlotWidth) / 2;

  const beadY = Math.min(height - 180, height - 80);
  const totalBeadWidth = COUNT * (BEAD_SIZE + 16) - 16;
  const beadStartX = (width - totalBeadWidth) / 2;

  const beads: BeadItem[] = Array.from({ length: COUNT }, (_, i) => ({
    id: i + 1,
    originX: beadStartX + i * (BEAD_SIZE + 16),
    originY: beadY,
    slotX: slotStartX + i * (SLOT_SIZE + 16) + (SLOT_SIZE - BEAD_SIZE) / 2,
    slotY: slotY + (SLOT_SIZE - BEAD_SIZE) / 2,
  }));

  const handleDone = useCallback((id: number) => {
    setPlaced((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size === COUNT) {
        // celebration handled by SceneShell
      } else {
        playSnap();
        speakNumber(next.size);
      }
      return next;
    });
  }, []);

  return (
    <SceneShell backgroundColor={COLORS.pastels[4]} safeArea={false} celebrate={done} celebrationMessage={`You counted to ${COUNT}!`}>
      <View style={styles.stage}>
        <Image
          source={IMAGES.scenes.counting}
          style={styles.hero}
          resizeMode="contain"
        />
        <Text style={styles.prompt}>Drag beads to the rod and count</Text>

        {Array.from({ length: COUNT }, (_, i) => (
          <View
            key={i}
            style={[
              styles.slot,
              {
                left: slotStartX + i * (SLOT_SIZE + 16),
                top: slotY,
              },
            ]}
          />
        ))}

        {beads.map((b) => (
          <DraggableBead key={b.id} bead={b} onDone={handleDone} />
        ))}

        {placed.size === COUNT ? (
          <Text style={styles.celebrate}>You counted to {COUNT}!</Text>
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
    height: 140,
    marginBottom: SPACING.md,
  },
  prompt: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  slot: {
    position: 'absolute',
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.primaryDark,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  bead: {
    position: 'absolute',
    width: BEAD_SIZE,
    height: BEAD_SIZE,
    borderRadius: RADIUS.full,
    backgroundColor: '#ffd24a',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  celebrate: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.h1,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success,
  },
});
