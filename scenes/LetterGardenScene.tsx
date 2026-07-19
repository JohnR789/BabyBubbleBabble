import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import SceneShell from '../components/SceneShell';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { IMAGES } from '../assets';
import { playPop } from '../utils/SoundManager';
import { speakLetter } from '../utils/speech';
import { lightImpact } from '../utils/haptics';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export default function LetterGardenScene() {
  const { width } = useWindowDimensions();
  const scales = useRef(LETTERS.map(() => new Animated.Value(1))).current;

  const handlePress = (letter: string, index: number) => {
    lightImpact();
    playPop();
    speakLetter(letter);
    Animated.sequence([
      Animated.timing(scales[index], { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.timing(scales[index], { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  const columns = width > 600 ? 5 : 3;
  const size = Math.min(110, (width - SPACING.lg * 2 - 20 * (columns - 1)) / columns);

  return (
    <SceneShell backgroundColor={COLORS.pastels[3]} safeArea={false}>
      <View style={styles.stage}>
        <Image
          source={IMAGES.scenes.letterGarden}
          style={styles.hero}
          resizeMode="contain"
        />
        <Text style={styles.prompt}>Tap a flower to hear its letter sound</Text>

        <View style={styles.grid}>
          {LETTERS.map((letter, i) => (
            <Pressable
              key={letter}
              onPress={() => handlePress(letter, i)}
              accessibilityRole="button"
              accessibilityLabel={`Letter ${letter}`}
            >
              <Animated.View
                style={[
                  styles.flower,
                  { width: size, height: size, transform: [{ scale: scales[i] }] },
                ]}
              >
                <Text style={styles.letter}>{letter}</Text>
              </Animated.View>
            </Pressable>
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
    alignItems: 'center',
  },
  hero: {
    width: '100%',
    height: 140,
    marginBottom: SPACING.md,
  },
  prompt: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  flower: {
    borderRadius: RADIUS.full,
    backgroundColor: '#ffd7f2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  letter: {
    fontSize: 40,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
});
