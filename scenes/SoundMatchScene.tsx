import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import SceneShell from '../components/SceneShell';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { IMAGES } from '../assets';
import { playBell, playDrum, playRattle, playSuccess } from '../utils/SoundManager';
import { speak } from '../utils/speech';
import { lightImpact } from '../utils/haptics';

const SOUNDS = [
  { key: 'bell', play: playBell, color: '#ff9aa2' },
  { key: 'drum', play: playDrum, color: '#a0c4ff' },
  { key: 'rattle', play: playRattle, color: '#fdffb6' },
];

const CYLINDERS = [
  { id: 'a', sound: 'bell' },
  { id: 'b', sound: 'drum' },
  { id: 'c', sound: 'rattle' },
  { id: 'd', sound: 'bell' },
  { id: 'e', sound: 'drum' },
  { id: 'f', sound: 'rattle' },
];

function getPlay(key: string) {
  return SOUNDS.find((s) => s.key === key)?.play ?? playRattle;
}

function getColor(key: string) {
  return SOUNDS.find((s) => s.key === key)?.color ?? '#caffbf';
}

export default function SoundMatchScene() {
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [shuffled] = useState(() => [...CYLINDERS].sort(() => Math.random() - 0.5));

  useEffect(() => {
    if (matched.size === CYLINDERS.length) {
      playSuccess();
      speak('You matched all the sounds!');
    }
  }, [matched]);

  const handleTap = (id: string, soundKey: string) => {
    if (matched.has(id)) return;
    lightImpact();
    getPlay(soundKey)();
    if (!selected) {
      setSelected(id);
      return;
    }
    if (selected === id) {
      setSelected(null);
      return;
    }
    const prevSound = shuffled.find((c) => c.id === selected)?.sound;
    if (prevSound === soundKey) {
      setMatched((prev) => {
        const next = new Set(prev);
        next.add(id);
        next.add(selected);
        return next;
      });
      setSelected(null);
      speak('Match!');
    } else {
      setSelected(null);
      speak('Try again');
    }
  };

  const columns = 3;
  const spacing = 20;
  const size = (width - SPACING.lg * 2 - spacing * (columns - 1)) / columns;

  return (
    <SceneShell backgroundColor={COLORS.pastels[2]} safeArea={false}>
      <View style={styles.stage}>
        <Image
          source={IMAGES.scenes.soundCylinders}
          style={styles.hero}
          resizeMode="contain"
        />
        <Text style={styles.prompt}>Tap two cylinders that sound the same</Text>

        <View style={styles.grid}>
          {shuffled.map((c, i) => {
            const isMatched = matched.has(c.id);
            const isSelected = selected === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => handleTap(c.id, c.sound)}
                disabled={isMatched}
                style={[
                  styles.cylinder,
                  { width: size, height: size, backgroundColor: getColor(c.sound) },
                  isMatched ? styles.matched : null,
                  isSelected ? styles.selected : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Cylinder ${i + 1}`}
                accessibilityState={{ disabled: isMatched }}
              />
            );
          })}
        </View>

        {matched.size === CYLINDERS.length ? (
          <Text style={styles.celebrate}>All matched!</Text>
        ) : null}
      </View>
    </SceneShell>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    padding: SPACING.lg,
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
  cylinder: {
    borderRadius: RADIUS.md,
    borderColor: COLORS.surface,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matched: {
    opacity: 0.4,
  },
  selected: {
    borderWidth: 4,
  },
  celebrate: {
    marginTop: SPACING.xl,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.h1,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.success,
  },
});
