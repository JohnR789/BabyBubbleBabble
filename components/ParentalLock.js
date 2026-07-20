import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

const TAPS_TO_UNLOCK = 5;
const RESET_MS = 2500;

export default function ParentalLock({ onUnlock, style = {}, label = '' }) {
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
      style={[styles.lockArea, style]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Parental area, tap ${TAPS_TO_UNLOCK} times to unlock`}
    >
      <Text style={styles.text}>{label || `Parental Area (Tap ${TAPS_TO_UNLOCK}x)`}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  lockArea: {
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: RADIUS.lg,
  },
  text: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.sizes.small,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
