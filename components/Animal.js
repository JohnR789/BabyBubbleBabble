import React from 'react';
import { Animated, TouchableWithoutFeedback, Image, StyleSheet } from 'react-native';

export default function Animal({ img, x, y, onTap, style }) {
  return (
    <Animated.View style={[
      styles.animalContainer,
      style,
      { left: x, top: y }
    ]}>
      <TouchableWithoutFeedback onPress={onTap}>
        <Image
          source={img}
          style={styles.animalImage}
          accessibilityLabel="Cute animal"
        />
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animalContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  animalImage: {
    width: 96,
    height: 96,
  },
});

