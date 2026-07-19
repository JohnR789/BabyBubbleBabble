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
import { playPlop, playSuccess } from '../utils/SoundManager';
import { speak } from '../utils/speech';
import { lightImpact } from '../utils/haptics';

const FLOWERS = [
  { id: 1, label: 'Pink', color: '#ff9aa2' },
  { id: 2, label: 'Yellow', color: '#fdffb6' },
  { id: 3, label: 'Purple', color: '#e6ddff' },
];

function DraggableFlower({
  flower,
  slotX,
  slotY,
  onDone,
}: {
  flower: (typeof FLOWERS)[number];
  slotX: number;
  slotY: number;
  onDone: (id: number) => void;
}) {
  const startX = flower.id * 90 - 90;
  const x = useSharedValue(startX);
  const y = useSharedValue(0);
  const placed = useSharedValue(false);

  const pan = Gesture.Pan()
    .enabled(!placed.value)
    .onBegin(() => {
      runOnJS(lightImpact)();
    })
    .onUpdate((event) => {
      x.value = startX + event.translationX;
      y.value = event.translationY;
    })
    .onEnd(() => {
      const dx = slotX - (startX + x.value - startX);
      const dy = slotY - y.value;
      if (Math.sqrt(dx * dx + dy * dy) < 70) {
        x.value = withSpring(slotX);
        y.value = withSpring(slotY);
        placed.value = true;
        runOnJS(onDone)(flower.id);
      } else {
        x.value = withSpring(startX);
        y.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
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

  const vaseX = width / 2 - 35;
  const vaseY = Math.min(height - 250, 360);

  const handleDone = useCallback((id: number) => {
    setPlaced((prev) => {
      const next = new Set(prev);
      next.add(id);
      playPlop();
      if (next.size === FLOWERS.length) {
        playSuccess();
        speak('What a beautiful arrangement!');
      } else {
        speak('Lovely!');
      }
      return next;
    });
  }, []);

  const startX = (width - FLOWERS.length * 90) / 2;

  return (
    <SceneShell backgroundColor={COLORS.pastels[0]} safeArea={false}>
      <View style={styles.stage}>
        <Image
          source={IMAGES.scenes.flowerArrange}
          style={styles.hero}
          resizeMode="contain"
        />
        <Text style={styles.prompt}>Drag each flower into the vase</Text>

        <View style={[styles.vase, { left: vaseX, top: vaseY }]} />

        <View style={[styles.tray, { left: startX, top: vaseY + 140 }]}>
          {FLOWERS.map((f, i) => (
            <DraggableFlower
              key={f.id}
              flower={f}
              slotX={vaseX - startX + 35}
              slotY={-120 - i * 35}
              onDone={handleDone}
            />
          ))}
        </View>

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
  tray: {
    position: 'absolute',
    flexDirection: 'row',
    width: FLOWERS.length * 90,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flower: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    marginHorizontal: 15,
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
