import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function ParentalLock({ onUnlock }) {
  const [count, setCount] = useState(0);

  function handlePress() {
    if (count >= 4) {
      setCount(0);
      onUnlock();
    } else {
      setCount(count + 1);
      setTimeout(() => setCount(0), 2500); // Reset after 2.5s
    }
  }

  return (
    <TouchableOpacity style={styles.lockArea} onPress={handlePress}>
      <Text style={styles.text}>Parental Area (Tap 5x)</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  lockArea: {
    position: 'absolute',
    bottom: 30,
    right: 18,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 18,
    zIndex: 99,
  },
  text: {
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});
