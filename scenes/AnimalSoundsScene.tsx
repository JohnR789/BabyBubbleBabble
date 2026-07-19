import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import SceneShell from '../components/SceneShell';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { IMAGES } from '../assets';
import { playAnimalSound } from '../utils/SoundManager';
import { lightImpact } from '../utils/haptics';

const ANIMALS = [
  { key: 'duck', label: 'Duck', sound: 'duck', image: IMAGES.animals.duck, tint: '#ffdfba' },
  { key: 'sheep', label: 'Sheep', sound: 'sheep', image: IMAGES.animals.sheep, tint: '#e2f0cb' },
  { key: 'frog', label: 'Frog', sound: 'frog', image: IMAGES.animals.frog, tint: '#b5ead7' },
  { key: 'cow', label: 'Cow', sound: 'cow', image: IMAGES.animals.cow, tint: '#ffd7f2' },
  { key: 'horse', label: 'Horse', sound: 'horse', image: IMAGES.animals.horse, tint: '#c7ceea' },
  { key: 'bunny', label: 'Bunny', sound: 'bunny', image: IMAGES.animals.bunny, tint: '#fcf8e8' },
] as const;

function AnimalCard({ animal }: { animal: (typeof ANIMALS)[number] }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [active, setActive] = useState(false);
  const { width } = useWindowDimensions();
  const columns = width > 600 ? 3 : 2;
  const cardSize = (width - SPACING.lg * (columns + 1)) / columns;

  const pressIn = useCallback(() => {
    Animated.timing(scale, {
      toValue: 0.92,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handlePress = useCallback(() => {
    setActive(true);
    lightImpact();
    playAnimalSound(animal.sound);
    setTimeout(() => setActive(false), 900);
  }, [animal]);

  const cardStyle = {
    width: cardSize,
    height: cardSize,
    backgroundColor: animal.tint,
  };

  return (
    <Pressable
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={handlePress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${animal.label} animal`}
      accessibilityHint="Tap to hear the sound"
      style={styles.pressable}
    >
      <Animated.View style={[styles.card, cardStyle, { transform: [{ scale }] }]}>
        <Image source={animal.image} style={styles.image} resizeMode="contain" />
        <Text style={[styles.label, active && styles.activeLabel]}>{animal.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function AnimalSoundsScene() {
  return (
    <SceneShell backgroundColor={COLORS.background} safeArea={false}>
      <View style={styles.stage}>
        <Text style={styles.prompt} accessibilityRole="header">
          Tap an animal to hear its sound
        </Text>
        <View style={styles.grid}>
          {ANIMALS.map((animal) => (
            <AnimalCard key={animal.key} animal={animal} />
          ))}
        </View>
      </View>
    </SceneShell>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    padding: SPACING.lg,
  },
  prompt: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pressable: {
    margin: SPACING.sm,
  },
  card: {
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: '70%',
    height: '60%',
  },
  label: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  activeLabel: {
    color: COLORS.primaryDark,
  },
});
