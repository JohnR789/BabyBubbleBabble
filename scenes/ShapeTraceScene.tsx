import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Animated as RNAnimated,
} from 'react-native';
import SceneShell from '../components/SceneShell';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { IMAGES } from '../assets';
import { playPop } from '../utils/SoundManager';
import { speak } from '../utils/speech';
import { lightImpact } from '../utils/haptics';

const SHAPES = [
  {
    key: 'circle',
    label: 'Circle',
    dots: [
      { x: 0, y: -80 },
      { x: 76, y: -25 },
      { x: 47, y: 65 },
      { x: -47, y: 65 },
      { x: -76, y: -25 },
    ],
  },
  {
    key: 'square',
    label: 'Square',
    dots: [
      { x: -60, y: -60 },
      { x: 60, y: -60 },
      { x: 60, y: 60 },
      { x: -60, y: 60 },
    ],
  },
  {
    key: 'triangle',
    label: 'Triangle',
    dots: [
      { x: 0, y: -70 },
      { x: 80, y: 60 },
      { x: -80, y: 60 },
    ],
  },
];

export default function ShapeTraceScene() {
  const { width } = useWindowDimensions();
  const [shapeIndex, setShapeIndex] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [fill] = useState(new RNAnimated.Value(0));
  const [celebrating, setCelebrating] = useState(false);

  const shape = SHAPES[shapeIndex];

  useEffect(() => {
    fill.setValue(0);
    setCelebrating(false);
  }, [shapeIndex, fill]);

  const handleDot = (i: number) => {
    lightImpact();
    playPop();
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(i);
      if (next.size === shape.dots.length) {
        RNAnimated.timing(fill, { toValue: 1, duration: 400, useNativeDriver: true }).start(() => {
          setCelebrating(true);
          setTimeout(() => {
            setShapeIndex((idx) => (idx + 1) % SHAPES.length);
            setVisited(new Set());
            fill.setValue(0);
          }, 1200);
        });
      } else {
        speak(String(i + 1));
      }
      return next;
    });
  };

  return (
    <SceneShell backgroundColor={COLORS.pastels[3]} safeArea={false} celebrate={celebrating} celebrationMessage={`You traced a ${shape.label}!`}>
      <View style={styles.stage}>
        <Image
          source={IMAGES.scenes.shapeTrace}
          style={styles.hero}
          resizeMode="contain"
        />
        <Text style={styles.prompt}>Tap the dots in order to trace the {shape.label}</Text>

        <View style={[styles.shape, { left: width / 2 - 100 }]}>
          {shape.dots.map((d, i) => (
            <Pressable
              key={i}
              onPress={() => handleDot(i)}
              disabled={visited.has(i)}
              style={[
                styles.dot,
                {
                  left: 100 + d.x - 16,
                  top: 100 + d.y - 16,
                  backgroundColor: visited.has(i) ? COLORS.success : COLORS.surface,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Dot ${i + 1}`}
            >
              <Text style={styles.dotText}>{i + 1}</Text>
            </Pressable>
          ))}

          <RNAnimated.View
            style={[
              styles.shapeFill,
              { opacity: fill },
            ]}
            pointerEvents="none"
          />
        </View>
      </View>
    </SceneShell>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
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
  shape: {
    position: 'absolute',
    top: 320,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
  },
  dotText: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  shapeFill: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(92,184,255,0.25)',
  },
});
