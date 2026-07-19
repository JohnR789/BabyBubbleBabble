import React, { useRef, useEffect } from 'react';
import { Animated, TouchableWithoutFeedback, Image, StyleSheet } from 'react-native';
import { IMAGES } from '../assets';

export default function Ball({ x, y, maxX, maxY, onBounce }) {
  const scale = useRef(new Animated.Value(1)).current;
  const animRef = useRef(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: Math.random() * maxY, duration: 900, useNativeDriver: false }),
        Animated.timing(x, { toValue: Math.random() * maxX, duration: 800, useNativeDriver: false }),
        Animated.timing(y, { toValue: Math.random() * maxY, duration: 1100, useNativeDriver: false }),
        Animated.timing(x, { toValue: Math.random() * maxX, duration: 800, useNativeDriver: false }),
      ]),
    );
    animRef.current = loop;
    loop.start();
    return () => {
      loop.stop();
      animRef.current = null;
    };
  }, [x, y, maxX, maxY]);

  function bounceAnim() {
    animRef.current?.stop();
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 110, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 170, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onBounce?.();
      if (animRef.current) animRef.current.start();
    });
  }

  return (
    <Animated.View style={[styles.ballContainer, { left: x, top: y, transform: [{ scale }] }]}>
      <TouchableWithoutFeedback onPress={bounceAnim}>
        <Image
          source={IMAGES.balls.ball1}
          style={styles.ballImage}
          accessibilityLabel="Bouncy ball"
          accessibilityRole="button"
        />
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ballContainer: {
    position: 'absolute',
  },
  ballImage: {
    width: 74,
    height: 74,
  },
});
