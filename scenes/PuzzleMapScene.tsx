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
import { speak } from '../utils/speech';
import { lightImpact } from '../utils/haptics';

const PIECES = [
  { id: '1', color: '#ff9aa2', slotX: 0, slotY: 0, label: 'Pink' },
  { id: '2', color: '#a0c4ff', slotX: 120, slotY: 0, label: 'Blue' },
  { id: '3', color: '#fdffb6', slotX: 0, slotY: 120, label: 'Yellow' },
  { id: '4', color: '#caffbf', slotX: 120, slotY: 120, label: 'Green' },
];

const SIZE = 100;
const SNAP = 50;

function DraggablePiece({
  piece,
  boardX,
  boardY,
  onDone,
}: {
  piece: (typeof PIECES)[number];
  boardX: number;
  boardY: number;
  onDone: (id: string) => void;
}) {
  const startX = piece.id === '1' || piece.id === '3' ? 20 : boardX + 260;
  const startY = piece.id === '1' || piece.id === '2' ? 40 : 180;
  const x = useSharedValue(startX);
  const y = useSharedValue(startY);
  const placed = useSharedValue(false);

  const pan = Gesture.Pan()
    .enabled(!placed.value)
    .onBegin(() => {
      runOnJS(lightImpact)();
    })
    .onUpdate((event) => {
      x.value = startX + event.translationX;
      y.value = startY + event.translationY;
    })
    .onEnd(() => {
      const targetX = boardX + piece.slotX + 10;
      const targetY = boardY + piece.slotY + 10;
      const dx = targetX - x.value;
      const dy = targetY - y.value;
      if (Math.sqrt(dx * dx + dy * dy) < SNAP) {
        x.value = withSpring(targetX);
        y.value = withSpring(targetY);
        placed.value = true;
        runOnJS(onDone)(piece.id);
      } else {
        x.value = withSpring(startX);
        y.value = withSpring(startY);
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
          styles.piece,
          { backgroundColor: piece.color },
          animatedStyle,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${piece.label} piece`}
      />
    </GestureDetector>
  );
}

export default function PuzzleMapScene() {
  const { width } = useWindowDimensions();
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const done = placed.size === PIECES.length;

  const boardX = (width - 240) / 2;
  const boardY = 260;

  const handleDone = useCallback((id: string) => {
    setPlaced((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size === PIECES.length) {
        // celebration handled by SceneShell
      } else {
        playSnap();
        speak('Good fit!');
      }
      return next;
    });
  }, []);

  return (
    <SceneShell backgroundColor={COLORS.pastels[2]} safeArea={false} celebrate={done} celebrationMessage="Puzzle complete!">
      <View style={styles.stage}>
        <Image
          source={IMAGES.scenes.puzzleMap}
          style={styles.hero}
          resizeMode="contain"
        />
        <Text style={styles.prompt}>Drag each piece to its spot</Text>

        <View style={[styles.board, { left: boardX, top: boardY }]}>
          {PIECES.map((p) => (
            <View
              key={p.id}
              style={[
                styles.slot,
                { left: p.slotX, top: p.slotY, borderColor: p.color },
              ]}
            />
          ))}
        </View>

        {PIECES.map((p) => (
          <DraggablePiece
            key={p.id}
            piece={p}
            boardX={boardX}
            boardY={boardY}
            onDone={handleDone}
          />
        ))}

        {placed.size === PIECES.length ? (
          <Text style={styles.celebrate}>Map complete!</Text>
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
  board: {
    position: 'absolute',
    width: 240,
    height: 240,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: RADIUS.xl,
  },
  slot: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderWidth: 3,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  piece: {
    position: 'absolute',
    width: SIZE - 20,
    height: SIZE - 20,
    borderRadius: RADIUS.md,
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
