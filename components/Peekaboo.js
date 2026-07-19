import React, { useRef, useEffect, useCallback } from 'react';
import { Animated, Pressable, Image, StyleSheet } from 'react-native';
import { lightImpact } from '../utils/haptics';

export default function Peekaboo({ x, y, img, onPeek }) {
  const scale = useRef(new Animated.Value(0)).current;
  const animRef = useRef(null);

  const showAnim = useCallback(() => {
    lightImpact();
    animRef.current?.stop();
    scale.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]);
    animRef.current = anim;
    anim.start(({ finished }) => {
      if (finished) onPeek?.();
    });
  }, [onPeek, scale]);

  useEffect(() => {
    showAnim();
  }, [img, showAnim]);

  return (
    <Animated.View style={[styles.peekabooContainer, { left: x, top: y, transform: [{ scale }] }]}>
      <Pressable onPress={showAnim} accessibilityLabel="Peekaboo" accessibilityRole="button">
        <Image source={img} style={styles.peekabooImage} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  peekabooContainer: {
    position: 'absolute',
  },
  peekabooImage: {
    width: 108,
    height: 108,
  },
});
