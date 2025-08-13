import React, { useState } from 'react';
import { View, Button, StyleSheet, Dimensions } from 'react-native';
import StackingBlock from '../components/StackingBlock';
import ParentalLock from '../components/ParentalLock';
import { playGiggleSound } from '../utils/SoundManager';
import MusicManager from '../utils/MusicManager';
import { useNavigation } from '@react-navigation/native';

// Import your PNG block images here
import blockRed from '../assets/images/blocks/block_red.png';
import blockBlue from '../assets/images/blocks/block_blue.png';
import blockGreen from '../assets/images/blocks/block_green.png';
import blockYellow from '../assets/images/blocks/block_yellow.png';
import blockPurple from '../assets/images/blocks/block_purple.png';
import blockPink from '../assets/images/blocks/block_pink.png';

const BLOCK_IMAGES = [blockRed, blockBlue, blockGreen, blockYellow, blockPurple, blockPink];
const COLORS = ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6'];
const LABELS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'PINK'];
const { width, height } = Dimensions.get('window');
const BLOCK_WIDTH = 90;
const BLOCK_HEIGHT = 38;
const TOWER_X = width / 2 - BLOCK_WIDTH / 2;
const BOTTOM_Y = height - 80;

export default function StackingScene() {
  // All blocks with their properties, including images!
  const [blocks, setBlocks] = useState(
    Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      img: BLOCK_IMAGES[i],     // <--- use cartoon PNGs!
      color: COLORS[i],
      label: LABELS[i],
      stacked: false,
      x: Math.random() * (width - BLOCK_WIDTH),
      y: BOTTOM_Y - Math.random() * 60,
    }))
  );
  const navigation = useNavigation();

  // Stacked and unstacked split
  const stackedBlocks = blocks.filter(b => b.stacked);
  const unstackedBlocks = blocks.filter(b => !b.stacked);

  function handleStack(id) {
    playGiggleSound();
    setBlocks(prev =>
      prev.map((b, idx) =>
        b.id === id
          ? {
              ...b,
              x: TOWER_X,
              y: BOTTOM_Y - BLOCK_HEIGHT * (stackedBlocks.length + 1),
              stacked: true,
            }
          : b
      )
    );
  }

  function resetStack() {
    setBlocks(blocks.map((b, i) => ({
      ...b,
      x: Math.random() * (width - BLOCK_WIDTH),
      y: BOTTOM_Y - Math.random() * 60,
      stacked: false,
    })));
  }

  return (
    <View style={styles.container}>
      <MusicManager />
      {/* Stacked blocks (drawn first, bottom-up) */}
      {stackedBlocks
        .sort((a, b) => a.id - b.id)
        .map((b, i) => (
          <StackingBlock
            key={b.id}
            img={b.img}
            color={b.color}    // fallback support
            label={b.label}    // fallback support
            x={TOWER_X}
            y={BOTTOM_Y - BLOCK_HEIGHT * (i + 1)}
            onStack={() => {}}
          />
        ))}
      {/* Unstacked blocks (can be tapped to stack) */}
      {unstackedBlocks.map(b => (
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
      <Button title="Reset Blocks" onPress={resetStack} />
      <ParentalLock onUnlock={() => navigation.navigate('ParentalArea')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8e8',
  },
});


