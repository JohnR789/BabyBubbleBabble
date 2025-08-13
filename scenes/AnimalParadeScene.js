// scenes/AnimalParadeScene.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
} from 'react-native';
import ParentalLock from '../components/ParentalLock';
import { playAnimalSound } from '../utils/SoundManager';
import MusicManager from '../utils/MusicManager';
import { useNavigation } from '@react-navigation/native';

// Use PNGs instead of SVGs
import duckPng from '../assets/images/animals/duck.png';
import sheepPng from '../assets/images/animals/sheep.png';
import cowPng from '../assets/images/animals/cow.png';
import horsePng from '../assets/images/animals/horse.png';

const { width, height } = Dimensions.get('window');

const ANIMAL_SIZE = 98;

const animals = [
  { key: 'duck', img: duckPng, sound: 'duck' },
  { key: 'sheep', img: sheepPng, sound: 'sheep' },
  { key: 'cow', img: cowPng, sound: 'cow' },
  { key: 'horse', img: horsePng, sound: 'horse' },
];

export default function AnimalParadeScene() {
  const [positions] = useState(
    animals.map(
      () =>
        new Animated.ValueXY({
          x: -ANIMAL_SIZE - 22,
          y: Math.random() * (height - (ANIMAL_SIZE + 22)),
        }),
    ),
  );
  const navigation = useNavigation();

  useEffect(() => {
    positions.forEach((pos, idx) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pos, {
            toValue: { x: width + ANIMAL_SIZE + 22, y: pos.y._value },
            duration: 6800 + idx * 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pos, {
            toValue: {
              x: -ANIMAL_SIZE - 22,
              y: Math.random() * (height - (ANIMAL_SIZE + 22)),
            },
            duration: 0,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    });
  }, [positions]);

  function handleAnimalTap(animal) {
    playAnimalSound(animal.sound);
  }

  return (
    <View style={styles.container}>
      <MusicManager />
      {animals.map((animal, i) => (
        <Animated.View
          key={animal.key}
          style={[
            styles.animalContainer,
            { left: positions[i].x, top: positions[i].y },
          ]}
        >
          <TouchableWithoutFeedback onPress={() => handleAnimalTap(animal)}>
            <View accessible accessibilityLabel={`${animal.key} animal`}>
              <Image
                source={animal.img}
                style={{ width: ANIMAL_SIZE, height: ANIMAL_SIZE }}
                resizeMode="contain"
              />
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      ))}
      <ParentalLock onUnlock={() => navigation.navigate('ParentalArea')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7ff',
  },
  animalContainer: {
    position: 'absolute',
    zIndex: 1,
  },
});
