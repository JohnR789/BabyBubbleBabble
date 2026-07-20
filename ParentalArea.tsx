import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from './theme';
import { useSettings } from './SettingsContext';
import { usePremium } from './PremiumContext';
import { purchaseService, type Product } from './services/purchase';
import { PREMIUM_PRODUCTS } from './constants';

interface RowProps {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  testID?: string;
}

function Row({ label, hint, value, onValueChange, testID }: RowProps) {
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

function StatusBadge({ isPremium, status, expiresAt }: { isPremium: boolean; status: string; expiresAt: number | null }) {
  let text = isPremium ? 'Premium active' : 'Free play';
  if (isPremium && expiresAt) {
    const date = new Date(expiresAt).toLocaleDateString();
    text = `Premium · expires ${date}`;
  } else if (status === 'loading') {
    text = 'Checking…';
  } else if (status === 'error') {
    text = 'Something went wrong';
  }
  return (
    <View style={[styles.badge, isPremium ? styles.badgeActive : styles.badgeInactive]}>
      <Text style={[styles.badgeText, isPremium ? styles.badgeTextActive : null]}>{text}</Text>
    </View>
  );
}

function PrimaryButton({ title, onPress, loading, disabled, style, testID }: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: object;
  testID?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, disabled && styles.disabledButton, style]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      testID={testID}
      activeOpacity={0.8}
    >
      {loading ? <ActivityIndicator color={COLORS.textInverse} size="small" /> : <Text style={styles.primaryButtonText}>{title}</Text>}
    </TouchableOpacity>
  );
}

function SecondaryButton({ title, onPress, testID }: { title: string; onPress: () => void; testID?: string }) {
  return (
    <TouchableOpacity
      style={styles.secondaryButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      testID={testID}
      activeOpacity={0.8}
    >
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </TouchableOpacity>
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

  const {
    isPremium,
    status,
    expiresAt,
    error,
    purchase,
    restore,
    activateTrial,
    deactivate,
    clearError,
  } = usePremium();

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    purchaseService.getProducts().then(setProducts).catch(() => {});
  }, []);

  const monthly = products.find((p) => p.productId === PREMIUM_PRODUCTS.monthly);
  const yearly = products.find((p) => p.productId === PREMIUM_PRODUCTS.yearly);

  const busy = status === 'loading';

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium</Text>
        <StatusBadge isPremium={isPremium} status={status} expiresAt={expiresAt} />

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={styles.errorDismiss}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!isPremium ? (
          <>
            <PrimaryButton
              title={monthly ? `Subscribe monthly · ${monthly.price}` : 'Subscribe monthly'}
              onPress={() => purchase(PREMIUM_PRODUCTS.monthly)}
              loading={busy}
              testID="subscribe-monthly"
            />
            <PrimaryButton
              title={yearly ? `Subscribe yearly · ${yearly.price}` : 'Subscribe yearly'}
              onPress={() => purchase(PREMIUM_PRODUCTS.yearly)}
              loading={busy}
              style={styles.buttonSpaced}
              testID="subscribe-yearly"
            />
            <SecondaryButton title="Restore purchases" onPress={restore} testID="restore-purchases" />
            <SecondaryButton title="Start 7-day free trial" onPress={() => activateTrial(7)} testID="start-trial" />
          </>
        ) : (
          <>
            <PrimaryButton title="Restore purchases" onPress={restore} loading={busy} testID="restore-purchases" />
            <SecondaryButton title="Clear premium (dev)" onPress={deactivate} testID="clear-premium" />
          </>
        )}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>About this app</Text>
        <Text style={styles.noteText}>
          Baby Bubble Babble is a gentle sensory playground for infants and
          toddlers. There are no ads, no analytics, and no links out of the app.
          All play happens offline with the assets bundled on your device.
          Purchases are only available inside this parent area.
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
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.soft,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  badgeActive: {
    backgroundColor: COLORS.success,
  },
  badgeInactive: {
    backgroundColor: '#e5e7eb',
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.small,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  badgeTextActive: {
    color: COLORS.textInverse,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonSpaced: {
    marginTop: SPACING.sm,
  },
  secondaryButton: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primaryDark,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  errorBox: {
    backgroundColor: '#fff2f2',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: TYPOGRAPHY.sizes.body,
  },
  errorDismiss: {
    color: COLORS.primaryDark,
    fontSize: TYPOGRAPHY.sizes.small,
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
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
