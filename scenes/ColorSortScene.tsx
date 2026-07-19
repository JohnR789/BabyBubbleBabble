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
import { playSnap, playSuccess } from '../utils/SoundManager';
import { speak } from '../utils/speech';
import { lightImpact } from '../utils/haptics';

const COLORS_LIST = [
  { key: 'red', label: 'Red', color: '#ff9aa2' },
  { key: 'blue', label: 'Blue', color: '#a0c4ff' },
  { key: 'yellow', label: 'Yellow', color: '#fdffb6' },
  { key: 'green', label: 'Green', color: '#caffbf' },
];

const BALL_SIZE = 56;
const BOWL_SIZE = 80;
const SNAP = 60;

interface BallItem {
  key: string;
  color: string;
  label: string;
  originX: number;
  originY: number;
  slotX: number;
  slotY: number;
}

function DraggableBall({
  ball,
  onDone,
}: {
  ball: BallItem;
  onDone: (key: string) => void;
}) {
  const x = useSharedValue(ball.originX);
  const y = useSharedValue(ball.originY);
  const placed = useSharedValue(false);

  const pan = Gesture.Pan()
    .enabled(!placed.value)
    .onBegin(() => {
      runOnJS(lightImpact)();
    })
    .onUpdate((event) => {
      x.value = ball.originX + event.translationX;
      y.value = ball.originY + event.translationY;
    })
    .onEnd(() => {
      const dx = ball.slotX - x.value;
      const dy = ball.slotY - y.value;
      if (Math.sqrt(dx * dx + dy * dy) < SNAP) {
        x.value = withSpring(ball.slotX);
        y.value = withSpring(ball.slotY);
        placed.value = true;
        runOnJS(onDone)(ball.key);
      } else {
        x.value = withSpring(ball.originX);
        y.value = withSpring(ball.originY);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.ball,
          { backgroundColor: ball.color },
          animatedStyle,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${ball.label} ball`}
      />
    </GestureDetector>
  );
}

export default function ColorSortScene() {
  const { width, height } = useWindowDimensions();
  const [placed, setPlaced] = useState<Set<string>>(new Set());

  const slotY = 160;
  const totalSlotWidth = COLORS_LIST.length * (BOWL_SIZE + 20) - 20;
  const slotStartX = (width - totalSlotWidth) / 2;

  const ballY = Math.min(height - 220, height - 120);
  const totalBallWidth = COLORS_LIST.length * (BALL_SIZE + 20) - 20;
  const ballStartX = (width - totalBallWidth) / 2;

  const balls: BallItem[] = COLORS_LIST.map((c, i) => ({
    ...c,
    originX: ballStartX + i * (BALL_SIZE + 20),
    originY: ballY,
    slotX: slotStartX + i * (BOWL_SIZE + 20) + (BOWL_SIZE - BALL_SIZE) / 2,
    slotY: slotY + (BOWL_SIZE - BALL_SIZE) / 2,
  }));

  const handleDone = useCallback((key: string) => {
    setPlaced((prev) => {
      const next = new Set(prev);
      next.add(key);
      if (next.size === COLORS_LIST.length) {
        playSuccess();
        speak('You sorted every color!');
      } else {
        playSnap();
        const label = COLORS_LIST.find((c) => c.key === key)?.label ?? key;
        speak(label);
      }
      return next;
    });
  }, []);

  return (
    <SceneShell backgroundColor={COLORS.pastels[1]} safeArea={false}>
      <View style={styles.stage}>
        <Image
          source={IMAGES.scenes.colorSort}
          style={styles.hero}
          resizeMode="contain"
        />
        <Text style={styles.prompt}>Drag each ball to its matching bowl</Text>

        {COLORS_LIST.map((c, i) => (
          <View
            key={c.key}
            style={[
              styles.bowl,
              {
                left: slotStartX + i * (BOWL_SIZE + 20),
                top: slotY,
                borderColor: c.color,
              },
            ]}
            accessibilityLabel={`${c.label} bowl`}
          />
        ))}

        {balls.map((b) => (
          <DraggableBall key={b.key} ball={b} onDone={handleDone} />
        ))}

        {placed.size === COLORS_LIST.length ? (
          <Text style={styles.celebrate}>All sorted!</Text>
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
  bowl: {
    position: 'absolute',
    width: BOWL_SIZE,
    height: BOWL_SIZE,
    borderWidth: 4,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: RADIUS.full,
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
