import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, Image, View, Text, StyleSheet } from 'react-native';

export default function StackingBlock({ img, color, label, x, y, stacked, onStack }) {
  const scale = useRef(new Animated.Value(1)).current;

  function triggerStack() {
    if (stacked) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.15, duration: 110, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onStack?.();
    });
  }

  return (
    <Animated.View
      style={[
        styles.blockContainer,
        { left: x, top: y, transform: [{ scale }] },
      ]}
    >
      <TouchableWithoutFeedback onPress={triggerStack}>
        {img ? (
          <Image
            source={img}
            style={styles.blockImage}
            resizeMode="contain"
            accessibilityLabel="Stacking block"
          />
        ) : (
          <View style={[styles.blockFallback, { backgroundColor: color }]}>
            <Text style={styles.blockLabel}>{label}</Text>
          </View>
        )}
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  blockContainer: {
    position: 'absolute',
    width: 90,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockImage: {
    width: 90,
    height: 38,
  },
  blockFallback: {
    width: 90,
    height: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
  },
});
