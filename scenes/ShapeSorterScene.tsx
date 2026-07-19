import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import SceneShell from '../components/SceneShell';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { playSnapSound, playGiggleSound } from '../utils/SoundManager';
import { lightImpact } from '../utils/haptics';

const SHAPE_SIZE = 80;
const SLOT_SIZE = 100;
const SNAP_DISTANCE = 60;
const GAP = 20;

interface ShapeSpec {
  key: string;
  color: string;
  borderRadius: number;
  label: string;
}

const SHAPES: ShapeSpec[] = [
  { key: 'circle', color: '#ff9aa2', borderRadius: 9999, label: 'circle' },
  { key: 'square', color: '#c7ceea', borderRadius: 12, label: 'square' },
  { key: 'rounded', color: '#b5ead7', borderRadius: 28, label: 'rounded' },
];

interface Point { x: number; y: number; }

function Slot({ x, y, shape }: { x: number; y: number; shape: ShapeSpec }) {
  return (
    <View
      style={[
        styles.slot,
        { left: x, top: y, borderColor: shape.color },
      ]}
      accessibilityLabel={`${shape.label} slot`}
    >
      <View
        style={[
          styles.slotGhost,
          { backgroundColor: shape.color, borderRadius: shape.borderRadius },
        ]}
      />
    </View>
  );
}

function DraggableShape({
  shape,
  origin,
  slot,
  onSnap,
}: {
  shape: ShapeSpec;
  origin: Point;
  slot: Point;
  onSnap: (key: string) => void;
}) {
  const x = useSharedValue(origin.x);
  const y = useSharedValue(origin.y);
  const isDragging = useSharedValue(false);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    x.value = withSpring(origin.x);
    y.value = withSpring(origin.y);
  }, [x, y, origin.x, origin.y]);

  const pan = Gesture.Pan()
    .enabled(!done)
    .onBegin(() => {
      isDragging.value = true;
      offsetX.value = x.value;
      offsetY.value = y.value;
    })
    .onUpdate((event) => {
      x.value = offsetX.value + event.translationX;
      y.value = offsetY.value + event.translationY;
    })
    .onEnd(() => {
      isDragging.value = false;
      const dx = slot.x - x.value;
      const dy = slot.y - y.value;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < SNAP_DISTANCE) {
        x.value = withSpring(slot.x);
        y.value = withSpring(slot.y);
        setDone(true);
        runOnJS(onSnap)(shape.key);
      } else {
        x.value = withSpring(origin.x);
        y.value = withSpring(origin.y);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
    zIndex: isDragging.value ? 10 : 1,
  }));

  const baseStyle = {
    width: SHAPE_SIZE,
    height: SHAPE_SIZE,
    borderRadius: shape.borderRadius,
    backgroundColor: shape.color,
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.shape, baseStyle, animatedStyle]}
        accessibilityRole="button"
        accessibilityLabel={`${shape.label} shape`}
        accessibilityHint="Drag to the matching slot" 
      />
    </GestureDetector>
  );
}

export default function ShapeSorterScene() {
  const { width, height } = useWindowDimensions();
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [celebrate, setCelebrate] = useState(false);

  const slotY = 140;
  const totalSlotWidth = SHAPES.length * (SLOT_SIZE + GAP) - GAP;
  const slotStartX = (width - totalSlotWidth) / 2;

  const shapeY = Math.min(height - 220, height - 120);
  const totalShapeWidth = SHAPES.length * (SHAPE_SIZE + GAP) - GAP;
  const shapeStartX = (width - totalShapeWidth) / 2;

  const slots = SHAPES.map((shape, i) => ({
    key: shape.key,
    x: slotStartX + i * (SLOT_SIZE + GAP) + (SLOT_SIZE - SHAPE_SIZE) / 2,
    y: slotY + (SLOT_SIZE - SHAPE_SIZE) / 2,
  }));

  const origins = SHAPES.map((shape, i) => ({
    key: shape.key,
    x: shapeStartX + i * (SHAPE_SIZE + GAP),
    y: shapeY,
  }));

  const handleSnap = useCallback((key: string) => {
    setPlaced((prev) => {
      const next = { ...prev, [key]: true };
      return next;
    });
    lightImpact();
    playSnapSound();
  }, []);

  useEffect(() => {
    if (Object.keys(placed).length === SHAPES.length) {
      setCelebrate(true);
    }
  }, [placed]);

  useEffect(() => {
    if (celebrate) {
      playGiggleSound();
    }
  }, [celebrate]);

  return (
    <SceneShell backgroundColor={COLORS.shapeSorter} safeArea={false}>
      <View style={styles.stage}>
        <Text style={styles.prompt} accessibilityRole="header">
          Match each shape to its spot
        </Text>

        {SHAPES.map((shape, i) => (
          <Slot key={shape.key} shape={shape} x={slots[i].x} y={slots[i].y} />
        ))}

        {SHAPES.map((shape, i) => (
          <DraggableShape
            key={shape.key}
            shape={shape}
            origin={origins[i]}
            slot={slots[i]}
            onSnap={handleSnap}
          />
        ))}

        {celebrate ? (
          <View style={styles.celebration} pointerEvents="none">
            <Text style={styles.celebrationText}>You did it!</Text>
          </View>
        ) : null}
      </View>
    </SceneShell>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
  },
  prompt: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
  },
  slot: {
    position: 'absolute',
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderWidth: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  slotGhost: {
    width: SHAPE_SIZE,
    height: SHAPE_SIZE,
    opacity: 0.25,
  },
  shape: {
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  celebration: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  celebrationText: {
    fontSize: 44,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
});
