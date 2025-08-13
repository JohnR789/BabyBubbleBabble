import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, Image, StyleSheet } from 'react-native';

export default function Peekaboo({ x, y, img, onPeek }) {
  const scale = useRef(new Animated.Value(0)).current;

  function showAnim() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start(onPeek);
  }

  return (
    <Animated.View
      style={[
        styles.peekabooContainer,
        { left: x, top: y, transform: [{ scale }] }
      ]}
    >
      <TouchableWithoutFeedback onPress={showAnim}>
        <Image
          source={img}
          style={styles.peekabooImage}
          accessibilityLabel="Peekaboo"
        />
      </TouchableWithoutFeedback>
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

