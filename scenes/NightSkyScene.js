import React, { useState, useEffect } from 'react';
import { View, Dimensions, Animated, StyleSheet } from 'react-native';
import Firefly from '../components/Firefly';
import ParentalLock from '../components/ParentalLock';
import { playPopSound } from '../utils/SoundManager';
import MusicManager from '../utils/MusicManager';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const FIREFLY_COUNT = 7;

function randomFirefly() {
  return {
    id: Math.random(),
    x: new Animated.Value(Math.random() * (width - 40)),
    y: new Animated.Value(Math.random() * (height - 140)),
    caught: false,
  };
}

export default function NightSkyScene() {
  const [fireflies, setFireflies] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    setFireflies(Array.from({ length: FIREFLY_COUNT }).map(randomFirefly));
  }, []);

  function handleCatch(id) {
    playPopSound();
    setFireflies(prev =>
      prev.map(f =>
        f.id === id ? { ...f, caught: true } : f
      )
    );
    setTimeout(() => {
      setFireflies(prev =>
        prev.map(f =>
          f.id === id
            ? randomFirefly()
            : f
        )
      );
    }, 1300);
  }

  return (
    <View style={styles.container}>
      <MusicManager />
      {fireflies.map(f =>
        !f.caught && (
          <Firefly
            key={f.id}
            x={f.x}
            y={f.y}
            onCatch={() => handleCatch(f.id)}
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
    backgroundColor: '#161831',
  },
});
