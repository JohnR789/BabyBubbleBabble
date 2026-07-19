import React, { useEffect, useState } from 'react';
import {
  View,
  Animated,
  useWindowDimensions,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import SceneShell from '../components/SceneShell';
import { playAnimalSound } from '../utils/SoundManager';
import { IMAGES } from '../assets';
import { COLORS } from '../theme';

const ANIMAL_SIZE = 98;

const ANIMALS = [
  { key: 'duck', source: IMAGES.animals.duck, sound: 'duck' },
  { key: 'sheep', source: IMAGES.animals.sheep, sound: 'sheep' },
  { key: 'cow', source: IMAGES.animals.cow, sound: 'cow' },
  { key: 'horse', source: IMAGES.animals.horse, sound: 'horse' },
  { key: 'bunny', source: IMAGES.animals.bunny, sound: 'bunny' },
];

export default function AnimalParadeScene() {
  const { width, height } = useWindowDimensions();
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (width === 0 || height === 0) return;

    const randomY = () => Math.random() * Math.max(1, height - ANIMAL_SIZE - 80);

    const nextPositions = ANIMALS.map(() =>
      new Animated.ValueXY({ x: -ANIMAL_SIZE - 22, y: randomY() }),
    );
    setPositions(nextPositions);

    const stopFns = nextPositions.map((pos, idx) => {
      const run = () => {
        const targetY = randomY();
        const duration = 6800 + idx * 1000;
        Animated.sequence([
          Animated.timing(pos, {
            toValue: { x: width + ANIMAL_SIZE + 22, y: pos.__getValue().y },
            duration,
            useNativeDriver: false,
          }),
          Animated.timing(pos, {
            toValue: { x: -ANIMAL_SIZE - 22, y: targetY },
            duration: 0,
            useNativeDriver: false,
          }),
        ]).start(({ finished }) => {
          if (finished) run();
        });
      };
      run();
      return () => pos.stopAnimation();
    });

    return () => stopFns.forEach((stop) => stop());
  }, [width, height]);

  function handleAnimalTap(animal) {
    playAnimalSound(animal.sound);
  }

  return (
    <SceneShell backgroundColor={COLORS.animal} safeArea={false}>
      <View style={styles.stage}>
        {ANIMALS.map((animal, i) =>
          positions[i] ? (
            <Animated.View
              key={animal.key}
              style={[styles.animalContainer, { left: positions[i].x, top: positions[i].y }]}
            >
              <Pressable
                onPress={() => handleAnimalTap(animal)}
                accessibilityLabel={`${animal.key} animal`}
                accessibilityRole="button"
              >
                <Image
                  source={animal.source}
                  style={styles.animalImage}
                  resizeMode="contain"
                />
              </Pressable>
            </Animated.View>
          ) : null,
        )}
      </View>
    </SceneShell>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
  },
  animalContainer: {
    position: 'absolute',
  },
  animalImage: {
    width: ANIMAL_SIZE,
    height: ANIMAL_SIZE,
  },
});
