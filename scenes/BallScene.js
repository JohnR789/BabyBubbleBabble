import React, { useState, useEffect } from 'react';
import { View, Dimensions, Animated, StyleSheet } from 'react-native';
import Ball from '../components/Ball';
import ParentalLock from '../components/ParentalLock';
import { playGiggleSound } from '../utils/SoundManager';
import MusicManager from '../utils/MusicManager';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const BALL_COUNT = 8;

export default function BallScene() {
  const [balls, setBalls] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    setBalls(
      Array.from({ length: BALL_COUNT }).map((_, i) => ({
        id: i + Math.random(),
        x: new Animated.Value(Math.random() * (width - 80)),
        y: new Animated.Value(Math.random() * (height - 220)),
      }))
    );
  }, []);

  function handleBallBounce(id) {
    playGiggleSound();
    setBalls(prev =>
      prev.length < 15
        ? prev.concat({
            id: Math.random(),
            x: new Animated.Value(Math.random() * (width - 80)),
            y: new Animated.Value(Math.random() * (height - 220)),
          })
        : prev
    );
  }

  return (
    <View style={styles.container}>
      <MusicManager />
      {balls.map(b => (
        <Ball
          key={b.id}
          x={b.x}
          y={b.y}
          onBounce={() => handleBallBounce(b.id)}
        />
      ))}
      <ParentalLock onUnlock={() => navigation.navigate('ParentalArea')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7e1',
  },
});

