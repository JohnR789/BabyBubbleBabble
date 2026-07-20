import React, { useEffect, useMemo } from 'react';
import { Animated, useWindowDimensions, StyleSheet, View, Text } from 'react-native';
import { playSuccess } from '../utils/SoundManager';
import { speak } from '../utils/speech';
import { COLORS, RADIUS } from '../theme';

const COLORS_LIST = [COLORS.success, COLORS.accent, COLORS.primary, COLORS.danger];
const SHAPES = ['⭐', '✨', '🌟', '💫'];
const COUNT = 10;

interface CelebrationProps {
  visible: boolean;
  message?: string;
}

function createAnims(width: number) {
  return Array.from({ length: COUNT }).map(() => ({
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(-60),
    rotate: new Animated.Value(0),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0.6 + Math.random() * 0.6),
    color: COLORS_LIST[Math.floor(Math.random() * COLORS_LIST.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    delay: Math.random() * 400,
    duration: 1000 + Math.random() * 1000,
  }));
}

export default function Celebration({ visible, message = 'Great job!' }: CelebrationProps) {
  const { width, height } = useWindowDimensions();
  const anims = useMemo(() => createAnims(width), [width]);

  useEffect(() => {
    if (!visible) return;

    playSuccess();
    speak(message);

    const controllers = anims.map((anim) => {
      anim.x.setValue(Math.random() * Math.max(1, width));
      anim.y.setValue(-60);
      anim.rotate.setValue(0);
      anim.opacity.setValue(0);

      const animation = Animated.sequence([
        Animated.delay(anim.delay),
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.timing(anim.y, { toValue: height + 60, duration: anim.duration, useNativeDriver: false }),
          Animated.timing(anim.rotate, { toValue: 360, duration: anim.duration, useNativeDriver: false }),
        ]),
        Animated.timing(anim.opacity, { toValue: 0, duration: 200, useNativeDriver: false }),
      ]);

      animation.start();
      return animation;
    });

    return () => {
      controllers.forEach((ctrl) => ctrl.stop());
    };
  }, [visible, width, height, message, anims]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: anim.x },
                { translateY: anim.y },
                { rotate: anim.rotate.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
                { scale: anim.scale },
              ],
              opacity: anim.opacity,
              backgroundColor: anim.color,
            },
          ]}
        >
          <Text style={styles.shape}>{anim.shape}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shape: {
    fontSize: 24,
  },
});
