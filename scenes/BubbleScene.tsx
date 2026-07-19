import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  useWindowDimensions,
  Easing,
} from 'react-native';
import SceneShell from '../components/SceneShell';
import Bubble from '../components/Bubble';
import { COLORS } from '../theme';
import { IMAGES } from '../assets';
import { playPopSound } from '../utils/SoundManager';

const TINTS = ['#9bd7ff', '#ffd7f2', '#ffe1a6', '#c9ffd2', '#e6ddff'];
const STICKERS = [
  IMAGES.animals.duck,
  IMAGES.animals.cow,
  IMAGES.animals.frog,
  IMAGES.animals.sheep,
  IMAGES.animals.bunny,
];
const STICKER_PROB = 0.15;
const SPAWN_INTERVAL_MS = 900;
const SIZE_MIN = 56;
const SIZE_MAX = 108;

interface BubbleItem {
  id: string;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  size: number;
  tint: string;
  sticker?: number;
  anim: Animated.CompositeAnimation;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function rint(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function createBubble(width: number, height: number): BubbleItem {
  const size = rint(SIZE_MIN, SIZE_MAX);
  const startX = rand(0, Math.max(0, width - size));
  const startY = height + size;
  const endY = -size * 2;
  const duration = rint(7000, 13000);
  const drift = rand(-size, size);

  const x = new Animated.Value(startX);
  const y = new Animated.Value(startY);
  const scale = new Animated.Value(0.7);
  const opacity = new Animated.Value(0.75);

  const anim = Animated.parallel([
    Animated.timing(y, {
      toValue: endY,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.timing(x, {
      toValue: Math.max(0, Math.min(width - size, startX + drift)),
      duration,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }),
    Animated.timing(scale, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }),
  ]);

  const tint = TINTS[rint(0, TINTS.length - 1)];
  const sticker = Math.random() < STICKER_PROB
    ? STICKERS[rint(0, STICKERS.length - 1)]
    : undefined;

  return {
    id: `bubble-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    x,
    y,
    scale,
    opacity,
    size,
    tint,
    sticker,
    anim,
  };
}

function BubbleEntity({
  bubble,
  onPop,
  onExpire,
}: {
  bubble: BubbleItem;
  onPop: (b: BubbleItem) => void;
  onExpire: (b: BubbleItem) => void;
}) {
  const { anim } = bubble;

  useEffect(() => {
    anim.start(({ finished }) => {
      if (finished) onExpire(bubble);
    });
    return () => anim.stop();
  }, [anim, bubble, onExpire]);

  const handlePop = useCallback(() => {
    anim.stop();
    playPopSound();
    onPop(bubble);
  }, [anim, bubble, onPop]);

  return (
    <Bubble
      tx={bubble.x}
      ty={bubble.y}
      scale={bubble.scale}
      opacity={bubble.opacity}
      size={bubble.size}
      tint={bubble.tint}
      sticker={bubble.sticker}
      onPop={handlePop}
    />
  );
}

export default function BubbleScene() {
  const { width, height } = useWindowDimensions();
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingRef = useRef<BubbleItem[]>([]);

  const spawn = useCallback(() => {
    const b = createBubble(width, height);
    pendingRef.current.push(b);
    setBubbles((prev) => [...prev, b]);
  }, [width, height]);

  useEffect(() => {
    if (width === 0 || height === 0) return;
    spawn();
    intervalRef.current = setInterval(spawn, SPAWN_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      pendingRef.current.forEach((b) => b.anim.stop());
    };
  }, [spawn, width, height]);

  const removeBubble = useCallback((bubble: BubbleItem) => {
    bubble.anim.stop();
    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
    pendingRef.current = pendingRef.current.filter((b) => b.id !== bubble.id);
  }, []);

  const handlePop = useCallback((bubble: BubbleItem) => {
    removeBubble(bubble);
  }, [removeBubble]);

  const handleExpire = useCallback((bubble: BubbleItem) => {
    removeBubble(bubble);
  }, [removeBubble]);

  return (
    <SceneShell backgroundColor={COLORS.bubble} safeArea={false}>
      <View style={styles.stage}>
        {bubbles.map((b) => (
          <BubbleEntity
            key={b.id}
            bubble={b}
            onPop={handlePop}
            onExpire={handleExpire}
          />
        ))}
      </View>
    </SceneShell>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
  },
});
