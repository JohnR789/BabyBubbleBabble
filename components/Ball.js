import React, { useRef, useEffect } from 'react';
import { Animated, TouchableWithoutFeedback, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Ball({ x, y, onBounce }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate bouncing: both horizontal and vertical
    Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: Math.random() * (height - 200), duration: 900, useNativeDriver: false }),
        Animated.timing(x, { toValue: Math.random() * (width - 80), duration: 800, useNativeDriver: false }),
        Animated.timing(y, { toValue: Math.random() * (height - 200), duration: 1100, useNativeDriver: false }),
        Animated.timing(x, { toValue: Math.random() * (width - 80), duration: 800, useNativeDriver: false }),
      ])
    ).start();
    // ✅ Add x, y as dependencies (recommended by ESLint)
  }, [x, y]);

  function bounceAnim() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 110, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 170, useNativeDriver: true }),
    ]).start(onBounce);
  }

  return (
    <Animated.View style={[
      styles.ballContainer,
      { left: x, top: y, transform: [{ scale }] }
    ]}>
      <TouchableWithoutFeedback onPress={bounceAnim}>
        <Image
          source={require('../assets/images/balls/ball1.png')}
          style={styles.ballImage}
          accessibilityLabel="Bouncy ball"
        />
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ballContainer: {
    position: 'absolute',
    zIndex: 1
  },
  ballImage: {
    width: 74,
    height: 74
  }
});


