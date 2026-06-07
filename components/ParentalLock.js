import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const TAPS_TO_UNLOCK = 5;
const RESET_MS = 2500;

export default function ParentalLock({ onUnlock }) {
  const countRef = useRef(0);
  const resetTimer = useRef(null);

  function clearReset() {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
  }

  useEffect(() => clearReset, []);

  function handlePress() {
    clearReset();
    const next = countRef.current + 1;
    if (next >= TAPS_TO_UNLOCK) {
      countRef.current = 0;
      onUnlock();
      return;
    }
    countRef.current = next;
    resetTimer.current = setTimeout(() => {
      countRef.current = 0;
      resetTimer.current = null;
    }, RESET_MS);
  }

  return (
    <TouchableOpacity
      style={styles.lockArea}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Parental area, tap ${TAPS_TO_UNLOCK} times to unlock`}
    >
      <Text style={styles.text}>{`Parental Area (Tap ${TAPS_TO_UNLOCK}x)`}</Text>
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
