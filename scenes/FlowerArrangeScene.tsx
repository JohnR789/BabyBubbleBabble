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

const FLOWERS = [
  { id: 1, label: 'Pink', color: '#ff9aa2' },
  { id: 2, label: 'Yellow', color: '#fdffb6' },
  { id: 3, label: 'Purple', color: '#e6ddff' },
];

const FLOWER_SIZE = 60;
const SNAP = 60;

interface FlowerItem {
  id: number;
  label: string;
  color: string;
  originX: number;
  originY: number;
  slotX: number;
  slotY: number;
}

function DraggableFlower({
  flower,
  onDone,
}: {
  flower: FlowerItem;
  onDone: (id: number) => void;
}) {
  const x = useSharedValue(flower.originX);
  const y = useSharedValue(flower.originY);
  const placed = useSharedValue(false);

  const pan = Gesture.Pan()
    .enabled(!placed.value)
    .onBegin(() => {
      runOnJS(lightImpact)();
    })
    .onUpdate((event) => {
      x.value = flower.originX + event.translationX;
      y.value = flower.originY + event.translationY;
    })
    .onEnd(() => {
      const dx = flower.slotX - x.value;
      const dy = flower.slotY - y.value;
      if (Math.sqrt(dx * dx + dy * dy) < SNAP) {
        x.value = withSpring(flower.slotX);
        y.value = withSpring(flower.slotY);
        placed.value = true;
        runOnJS(onDone)(flower.id);
      } else {
        x.value = withSpring(flower.originX);
        y.value = withSpring(flower.originY);
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
          styles.flower,
          { backgroundColor: flower.color },
          animatedStyle,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${flower.label} flower`}
      />
    </GestureDetector>
  );
}

export default function FlowerArrangeScene() {
  const { width, height } = useWindowDimensions();
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  const done = placed.size === FLOWERS.length;

  const vaseX = width / 2 - 35;
  const vaseY = 280;
  const trayY = Math.min(height - 180, height - 80);
  const trayX = (width - FLOWERS.length * 100 + 20) / 2;

  const flowers: FlowerItem[] = FLOWERS.map((f, i) => ({
    ...f,
    originX: trayX + i * 100,
    originY: trayY,
    slotX: vaseX + 5,
    slotY: vaseY - 30 - i * (FLOWER_SIZE - 10),
  }));

  const handleDone = useCallback((id: number) => {
    setPlaced((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size === FLOWERS.length) {
        // celebration handled by SceneShell
      } else {
        playPlop();
        speak('Lovely!');
      }
      return next;
    });
  }, []);

  return (
    <SceneShell backgroundColor={COLORS.pastels[0]} safeArea={false} celebrate={done} celebrationMessage="What a beautiful arrangement!">
      <View style={styles.stage}>
        <Image
          source={IMAGES.scenes.flowerArrange}
          style={styles.hero}
          resizeMode="contain"
        />
        <Text style={styles.prompt}>Drag each flower into the vase</Text>

        <View style={[styles.vase, { left: vaseX, top: vaseY }]} />

        {flowers.map((f) => (
          <DraggableFlower key={f.id} flower={f} onDone={handleDone} />
        ))}

        {placed.size === FLOWERS.length ? (
          <Text style={styles.celebrate}>Beautiful!</Text>
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
  vase: {
    position: 'absolute',
    width: 70,
    height: 90,
    borderRadius: RADIUS.md,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  flower: {
    position: 'absolute',
    width: FLOWER_SIZE,
    height: FLOWER_SIZE,
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
