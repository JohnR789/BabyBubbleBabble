// components/Bubble.js
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
  tint,        // optional hex like '#9bd7ff'
  sticker,     // optional require('...png')
}) {
  return (
    <TouchableWithoutFeedback onPress={onPop} accessibilityRole="button" accessibilityLabel="bubble">
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          transform: [{ translateX: tx }, { translateY: ty }, { scale: scale || 1 }],
          opacity: opacity || 1,
        }}
        pointerEvents="auto"
      >
        {/* subtle tinted aura */}
        {tint ? <View style={[styles.aura, { backgroundColor: hexToRgba(tint, 0.08), width: size, height: size, borderRadius: size/2 }]} /> : null}

        {/* pop ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: tint ? hexToRgba(tint, 0.65) : 'rgba(255,255,255,0.65)',
              transform: [{ scale: ringScale || 1 }],
              opacity: ringOpacity || 0,
            },
          ]}
          pointerEvents="none"
        />

        {/* bubble sprite */}
        <Image
          source={require('../assets/images/bubbles/bubble1.png')}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />

        {/* optional sticker */}
        {sticker ? (
          <Image
            source={sticker}
            style={{
              position: 'absolute',
              width: size * 0.42,
              height: size * 0.42,
              left: size * 0.29,
              top: size * 0.29,
              opacity: 0.9,
            }}
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

// small helper (kept local to avoid deps)
function hexToRgba(hex, alpha = 1) {
  const c = hex.replace('#', '');
  const bigint = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}







