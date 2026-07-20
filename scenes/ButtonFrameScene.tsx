import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import SceneShell from '../components/SceneShell';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { IMAGES } from '../assets';
import { playSnap } from '../utils/SoundManager';
import { speak } from '../utils/speech';
import { lightImpact } from '../utils/haptics';

const BUTTONS = [
  { id: 1, color: '#ff9aa2' },
  { id: 2, color: '#a0c4ff' },
  { id: 3, color: '#fdffb6' },
];

export default function ButtonFrameScene() {
  const { width } = useWindowDimensions();
  const [buttoned, setButtoned] = useState<Set<number>>(new Set());
  const done = buttoned.size === BUTTONS.length;

  const handlePress = (id: number) => {
    if (buttoned.has(id)) return;
    lightImpact();
    playSnap();
    setButtoned((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size === BUTTONS.length) {
        // celebration handled by SceneShell
      } else {
        speak('Snap!');
      }
      return next;
    });
  };

  const totalWidth = BUTTONS.length * 100 - 20;
  const startX = (width - totalWidth) / 2;

  return (
    <SceneShell backgroundColor={COLORS.pastels[1]} safeArea={false} celebrate={done} celebrationMessage="All buttoned up!">
      <View style={styles.stage}>
        <Image
          source={IMAGES.scenes.buttonFrame}
          style={styles.hero}
          resizeMode="contain"
        />
        <Text style={styles.prompt}>Tap each button through its hole</Text>

        <View style={[styles.fabric, { left: startX }]}>
          {BUTTONS.map((b, i) => (
            <Button
              key={b.id}
              color={b.color}
              x={i * 100}
              done={buttoned.has(b.id)}
              onPress={() => handlePress(b.id)}
            />
          ))}
        </View>

        {buttoned.size === BUTTONS.length ? (
          <Text style={styles.celebrate}>All buttoned!</Text>
        ) : null}
      </View>
    </SceneShell>
  );
}

function Button({
  color,
  x,
  done,
  onPress,
}: {
  color: string;
  x: number;
  done: boolean;
  onPress: () => void;
}) {
  const y = useSharedValue(0);

  const onPressIn = () => {
    y.value = withSpring(done ? 35 : 35);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <Pressable
      onPress={onPressIn}
      disabled={done}
      accessibilityRole="button"
      accessibilityLabel="Button"
      style={[styles.buttonHole, { left: x }]}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: color },
          animatedStyle,
        ]}
      />
    </Pressable>
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
  fabric: {
    width: BUTTONS.length * 100 - 20,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    position: 'relative',
  },
  buttonHole: {
    position: 'absolute',
    top: 80,
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  celebrate: {
    marginTop: SPACING.xl,
    fontSize: TYPOGRAPHY.sizes.h1,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success,
  },
});
