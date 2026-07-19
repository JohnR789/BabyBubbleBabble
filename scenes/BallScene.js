import React, { useEffect, useState } from 'react';
import { View, Animated, useWindowDimensions, StyleSheet } from 'react-native';
import Ball from '../components/Ball';
import SceneShell from '../components/SceneShell';
import { playGiggleSound } from '../utils/SoundManager';
import { COLORS } from '../theme';

const INITIAL_BALLS = 8;
const MAX_BALLS = 15;
const PADDING_X = 80;
const PADDING_Y = 220;

function createBall(maxX, maxY) {
  return {
    id: Math.random().toString(36).slice(2),
    x: Math.random() * maxX,
    y: Math.random() * maxY,
  };
}

export default function BallScene() {
  const { width, height } = useWindowDimensions();
  const [balls, setBalls] = useState([]);

  const maxX = Math.max(0, width - PADDING_X);
  const maxY = Math.max(0, height - PADDING_Y);

  useEffect(() => {
    if (width === 0 || height === 0) return;
    setBalls(
      Array.from({ length: INITIAL_BALLS }).map(() => createBall(maxX, maxY)),
    );
  }, [width, height, maxX, maxY]);

  function handleBallBounce() {
    playGiggleSound();
    setBalls((prev) =>
      prev.length < MAX_BALLS ? [...prev, createBall(maxX, maxY)] : prev,
    );
  }

  return (
    <SceneShell backgroundColor={COLORS.ball} safeArea={false}>
      <View style={styles.stage}>
        {balls.map((b) => (
          <Ball
            key={b.id}
            x={new Animated.Value(b.x)}
            y={new Animated.Value(b.y)}
            maxX={maxX}
            maxY={maxY}
            onBounce={handleBallBounce}
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
