import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, useWindowDimensions, StyleSheet } from 'react-native';
import StackingBlock from '../components/StackingBlock';
import SceneShell from '../components/SceneShell';
import { playGiggleSound } from '../utils/SoundManager';
import { IMAGES } from '../assets';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../theme';

const BLOCKS = [
  { id: 0, img: IMAGES.blocks.red, color: '#F87171', label: 'RED' },
  { id: 1, img: IMAGES.blocks.blue, color: '#60A5FA', label: 'BLUE' },
  { id: 2, img: IMAGES.blocks.green, color: '#34D399', label: 'GREEN' },
  { id: 3, img: IMAGES.blocks.yellow, color: '#FBBF24', label: 'YELLOW' },
  { id: 4, img: IMAGES.blocks.purple, color: '#A78BFA', label: 'PURPLE' },
  { id: 5, img: IMAGES.blocks.pink, color: '#F472B6', label: 'PINK' },
];

const BLOCK_WIDTH = 90;
const BLOCK_HEIGHT = 38;

export default function StackingScene() {
  const { width, height } = useWindowDimensions();
  const [blocks, setBlocks] = useState([]);

  const towerX = width / 2 - BLOCK_WIDTH / 2;
  const bottomY = Math.max(120, height - 100);

  useEffect(() => {
    if (width === 0 || height === 0) return;
    resetBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  function resetBlocks() {
    setBlocks(
      BLOCKS.map((b) => ({
        ...b,
        x: Math.random() * Math.max(0, width - BLOCK_WIDTH),
        y: bottomY - Math.random() * 60,
        stacked: false,
      })),
    );
  }

  function handleStack(id) {
    playGiggleSound();
    setBlocks((prev) => {
      const stackedCount = prev.filter((b) => b.stacked).length;
      return prev.map((b) =>
        b.id === id
          ? {
              ...b,
              x: towerX,
              y: bottomY - BLOCK_HEIGHT * (stackedCount + 1),
              stacked: true,
            }
          : b,
      );
    });
  }

  const stackedBlocks = blocks.filter((b) => b.stacked).sort((a, b) => a.id - b.id);
  const unstackedBlocks = blocks.filter((b) => !b.stacked);

  return (
    <SceneShell backgroundColor={COLORS.stacking} safeArea>
      <View style={styles.stage}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetBlocks}
          activeOpacity={0.8}
          accessibilityLabel="Reset blocks"
        >
          <Text style={styles.resetText}>Reset Blocks</Text>
        </TouchableOpacity>

        {stackedBlocks.map((b, i) => (
          <StackingBlock
            key={b.id}
            img={b.img}
            color={b.color}
            label={b.label}
            x={towerX}
            y={bottomY - BLOCK_HEIGHT * (i + 1)}
            stacked
            onStack={() => {}}
          />
        ))}

        {unstackedBlocks.map((b) => (
          <StackingBlock
            key={b.id}
            img={b.img}
            color={b.color}
            label={b.label}
            x={b.x}
            y={b.y}
            onStack={() => handleStack(b.id)}
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
  resetButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    zIndex: 10,
  },
  resetText: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.small,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
