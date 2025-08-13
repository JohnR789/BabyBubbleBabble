import React, { useEffect, useRef } from 'react';
import { Animated, TouchableWithoutFeedback, Image, StyleSheet } from 'react-native';

export default function Bubble({ x, y, onPop }) {
  const scale = useRef(new Animated.Value(1)).current;

  function popAnim() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0, duration: 140, useNativeDriver: true })
    ]).start(onPop);
  }

  useEffect(() => {
    // Floating animation: up and down gently
    Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: y.__getValue() - 45, duration: 1700, useNativeDriver: false }),
        Animated.timing(y, { toValue: y.__getValue(), duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, [y]); // ✅ Add y as dependency

  return (
    <Animated.View style={[
      styles.bubbleContainer,
      { left: x, top: y, transform: [{ scale }] }
    ]}>
      <TouchableWithoutFeedback onPress={popAnim}>
        <Image
          source={require('../assets/images/bubbles/bubble1.png')}
          style={styles.bubbleImage}
          accessibilityLabel="Smiling bubble"
        />
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  bubbleImage: {
    width: 94,
    height: 94,
  },
});


