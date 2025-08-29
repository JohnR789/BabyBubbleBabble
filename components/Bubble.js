// components/Bubble.js
import React, { useMemo } from 'react';
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
  disabled = false,
  hitSlop = { top: 14, left: 14, right: 14, bottom: 14 },
  extraTransforms = [],
}) {
  const containerStyle = useMemo(() => ([
    styles.abs,
    {
      width: size,
      height: size,
      transform: [
        { translateX: tx },
        { translateY: ty },
        ...(extraTransforms || []),
        { scale: scale ?? 1 },
      ],
      opacity: opacity ?? 1,
    },
  ]), [size, tx, ty, scale, opacity, extraTransforms]);

  const ringStyle = useMemo(() => ([
    styles.ring,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderColor: tint ? hexToRgba(tint, 0.65) : 'rgba(255,255,255,0.65)',
      transform: [{ scale: ringScale ?? 1 }],
      opacity: ringOpacity ?? 0,
    },
  ]), [size, tint, ringScale, ringOpacity]);

  const auraStyle = useMemo(() => ([
    styles.aura,
    { backgroundColor: tint ? hexToRgba(tint, 0.08) : 'transparent', width: size, height: size, borderRadius: size / 2 },
  ]), [tint, size]);

  const imageStyle = useMemo(() => ({ width: size, height: size }), [size]);

  const content = (
    <Animated.View style={containerStyle} pointerEvents={disabled ? 'none' : 'auto'}>
      {tint ? <View style={auraStyle} /> : null}

      <Animated.View style={ringStyle} pointerEvents="none" />

      <Image
        source={require('../assets/images/bubbles/bubble1.png')}
        style={imageStyle}
        resizeMode="contain"
      />

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
  );

  if (disabled) return content;

  return (
    <TouchableWithoutFeedback
      onPress={onPop}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel="bubble"
    >
      {content}
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  aura: { position: 'absolute' },
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







