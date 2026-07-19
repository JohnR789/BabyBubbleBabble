import React from 'react';
import { Animated, TouchableWithoutFeedback, Image, StyleSheet, View } from 'react-native';

export default function Bubble({
  tx,
  ty,
  scale,
  opacity,
  ringScale,
  ringOpacity,
  size = 72,
  onPop,
  tint,
  sticker,
}) {
  const bubbleContainerStyle = {
    position: 'absolute',
    width: size,
    height: size,
    transform: [{ translateX: tx }, { translateY: ty }, { scale: scale || 1 }],
    opacity: opacity || 1,
  };

  const auraStyle = [
    styles.aura,
    {
      backgroundColor: tint ? hexToRgba(tint, 0.08) : 'rgba(255,255,255,0.08)',
      width: size,
      height: size,
      borderRadius: size / 2,
    },
  ];

  const ringStyle = [
    styles.ring,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderColor: tint ? hexToRgba(tint, 0.65) : 'rgba(255,255,255,0.65)',
      transform: [{ scale: ringScale || 1 }],
      opacity: ringOpacity || 0,
    },
  ];

  const imageStyle = { width: size, height: size };

  const stickerStyle = {
    position: 'absolute',
    width: size * 0.42,
    height: size * 0.42,
    left: size * 0.29,
    top: size * 0.29,
    opacity: 0.9,
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPop}
      accessibilityRole="button"
      accessibilityLabel="bubble"
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Animated.View
        style={bubbleContainerStyle}
        pointerEvents="auto"
      >
        {tint ? (
          <View
            style={auraStyle}
          />
        ) : null}

        <Animated.View
          style={ringStyle}
          pointerEvents="none"
        />

        <Image
          source={require('../assets/images/bubbles/bubble1.png')}
          style={imageStyle}
          resizeMode="contain"
        />

        {sticker ? (
          <Image
            source={sticker}
            style={stickerStyle}
            resizeMode="contain"
          />
        ) : null}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  aura: {
    position: 'absolute',
  },
});

function hexToRgba(hex, alpha = 1) {
  const c = hex.replace('#', '');
  const normalized = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
