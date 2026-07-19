import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from './theme';
import { useSettings } from './SettingsContext';

function Row({ label, hint, value, onValueChange, testID }: {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  testID?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        testID={testID}
      />
    </View>
  );
}

export default function ParentalArea() {
  const navigation = useNavigation();
  const {
    musicOn,
    setMusicOn,
    sfxOn,
    setSfxOn,
    reducedMotion,
    setReducedMotion,
    nightMode,
    setNightMode,
  } = useSettings();

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Parental Controls</Text>

      <Row
        label="Background music"
        hint="Soft lullabies that loop while playing."
        value={musicOn}
        onValueChange={setMusicOn}
        testID="music-toggle"
      />

      <Row
        label="Sound effects"
        hint="Pops, giggles and animal sounds."
        value={sfxOn}
        onValueChange={setSfxOn}
        testID="sfx-toggle"
      />

      <Row
        label="Reduced motion"
        hint="Slow down or pause decorative motion."
        value={reducedMotion}
        onValueChange={setReducedMotion}
        testID="reduced-motion-toggle"
      />

      <Row
        label="Night mode"
        hint="Darker palettes for calmer evening play."
        value={nightMode}
        onValueChange={setNightMode}
        testID="night-mode-toggle"
      />

      <View style={styles.note}>
        <Text style={styles.noteTitle}>About this app</Text>
        <Text style={styles.noteText}>
          Baby Bubble Babble is a gentle sensory playground for infants and
          toddlers. There are no ads, no analytics, and no links out of the app.
          All play happens offline with the assets bundled on your device.
        </Text>
      </View>

      {navigation?.goBack ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Done, back to play"
        >
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    backgroundColor: COLORS.background,
    flexGrow: 1,
    gap: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.h1,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.soft,
  },
  rowText: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  hint: {
    fontSize: TYPOGRAPHY.sizes.small,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  note: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.soft,
  },
  noteTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  noteText: {
    fontSize: TYPOGRAPHY.sizes.small,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  button: {
    marginTop: 'auto',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
