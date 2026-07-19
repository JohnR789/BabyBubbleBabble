import React, { useRef, useEffect } from 'react';
import { Animated, TouchableWithoutFeedback, Image, StyleSheet } from 'react-native';
import { IMAGES } from '../assets';

export default function Firefly({ x, y, onCatch }) {
  const twinkle = useRef(new Animated.Value(0.75)).current;
  const animRef = useRef(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0.75, duration: 900, useNativeDriver: true }),
      ]),
    );
    animRef.current = loop;
    loop.start();
    return () => {
      loop.stop();
      animRef.current = null;
    };
  }, [twinkle]);

  return (
    <Animated.View style={[styles.fireflyContainer, { left: x, top: y, opacity: twinkle }]}>
      <TouchableWithoutFeedback onPress={onCatch}>
        <Image
          source={IMAGES.icons.firefly}
          style={styles.fireflyImage}
          accessibilityLabel="Firefly"
          accessibilityRole="button"
        />
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fireflyContainer: {
    position: 'absolute',
  },
  fireflyImage: {
    width: 46,
    height: 46,
  },
});
