import React, { useState, useEffect } from 'react';
import { View, Dimensions, Animated, StyleSheet } from 'react-native';
import Bubble from '../components/Bubble';
import ParentalLock from '../components/ParentalLock';
import { playPopSound } from '../utils/SoundManager';
import MusicManager from '../utils/MusicManager';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const BUBBLE_COUNT = 10;

export default function BubbleScene() {
  const [bubbles, setBubbles] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    setBubbles(
      Array.from({ length: BUBBLE_COUNT }).map((_, i) => ({
        id: i + Math.random(),
        x: new Animated.Value(Math.random() * (width - 90)),
        y: new Animated.Value(height - 120 - Math.random() * 200),
        popped: false,
      }))
    );
  }, []);

  function handleBubblePop(id) {
    playPopSound();
    setBubbles(prev =>
      prev.map(b => (b.id === id ? { ...b, popped: true } : b))
    );
    setTimeout(() => {
      setBubbles(prev =>
        prev.map(b =>
          b.id === id
            ? {
                ...b,
                x: new Animated.Value(Math.random() * (width - 90)),
                y: new Animated.Value(height - 120 - Math.random() * 200),
                popped: false,
              }
            : b
        )
      );
    }, 1000);
  }

  return (
    <View style={styles.container}>
      <MusicManager />
      {bubbles.map(b =>
        !b.popped && (
          <Bubble
            key={b.id}
            x={b.x}
            y={b.y}
            onPop={() => handleBubblePop(b.id)}
          />
        )
      )}
      <ParentalLock onUnlock={() => navigation.navigate('ParentalArea')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5f6ff',
  },
});



