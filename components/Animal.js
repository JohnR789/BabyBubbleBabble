import React from 'react';
import { Animated, Pressable, Image, StyleSheet } from 'react-native';
import { lightImpact } from '../utils/haptics';

export default function Animal({ img, x, y, onTap, style }) {
  return (
    <Animated.View style={[
      styles.animalContainer,
      style,
      { left: x, top: y }
    ]}>
      <Pressable onPress={() => { lightImpact(); onTap?.(); }} accessibilityLabel="Cute animal" accessibilityRole="button">
        <Image source={img} style={styles.animalImage} />
      </Pressable>
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

