import React, { useRef, useEffect } from 'react';
import { Animated, TouchableWithoutFeedback, Image, StyleSheet } from 'react-native';

export default function Firefly({ x, y, onCatch }) {
  const twinkle = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0.75, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [twinkle]); // ✅ add twinkle as dependency

  return (
    <Animated.View
      style={[
        styles.fireflyContainer,
        { left: x, top: y, opacity: twinkle }
      ]}
    >
      <TouchableWithoutFeedback onPress={onCatch}>
        <Image
          source={require('../assets/images/icons/firefly.png')}
          style={styles.fireflyImage}
          accessibilityLabel="Firefly"
        />
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fireflyContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  fireflyImage: {
    width: 46,
    height: 46,
  },
});


