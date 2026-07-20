import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView, View, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppParamList } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
import { SCENES, ROUTES } from '../constants';
import { usePremium } from '../PremiumContext';
import ParentalLock from '../components/ParentalLock';
import { speak } from '../utils/speech';
import { playSuccess, playSnap } from '../utils/SoundManager';
import { lightImpact } from '../utils/haptics';

type HomeNavigationProp = StackNavigationProp<AppParamList, typeof ROUTES.Home>;

interface SceneCardProps {
  route: string;
  label: string;
  icon: string;
  premium: boolean;
  isPremium: boolean;
  onLockedPress: () => void;
}

function SceneCard({ route, label, icon, premium, isPremium, onLockedPress }: SceneCardProps) {
  const navigation = useNavigation<HomeNavigationProp>();
  const index = SCENES.findIndex((s) => s.route === route);
  const tint = COLORS.pastels[index % COLORS.pastels.length];
  const locked = premium && !isPremium;

  function handlePress() {
    if (locked) {
      onLockedPress();
      return;
    }
    lightImpact();
    playSnap();
    navigation.navigate(route as keyof AppParamList & string);
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: tint }, locked && styles.cardLocked]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={locked ? `${label} locked` : `Open ${label}`}
      accessibilityState={{ disabled: false }}
      activeOpacity={0.8}
    >
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardText}>{label}</Text>
      {locked ? <Text style={styles.lockIndicator}>🔒</Text> : null}
    </TouchableOpacity>
  );
}

export default function Home() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { isPremium } = usePremium();
  const [showUpsell, setShowUpsell] = useState(false);

  const lockedCount = SCENES.filter((s) => s.premium).length;
  const lockedVisible = lockedCount > 0 && !isPremium;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Baby Bubble Babble</Text>
      <Text style={styles.subtitle}>A gentle world for little fingers</Text>

      <View style={styles.grid}>
        {SCENES.map((scene) => (
          <SceneCard
            key={scene.route}
            route={scene.route}
            label={scene.label}
            icon={scene.icon}
            premium={scene.premium}
            isPremium={isPremium}
            onLockedPress={() => {
              lightImpact();
              playSuccess();
              speak('Ask a grown-up to unlock more play areas.');
              setShowUpsell(true);
            }}
          />
        ))}
      </View>

      {lockedVisible ? (
        <View style={styles.upsell}>
          <Text style={styles.upsellTitle}>More fun awaits!</Text>
          <Text style={styles.upsellBody}>
            Unlock {lockedCount} more Montessori play areas and keep learning every day.
          </Text>
          <TouchableOpacity
            style={styles.upsellButton}
            onPress={() => {
              lightImpact();
              setShowUpsell(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Unlock more play areas"
          >
            <Text style={styles.upsellButtonText}>Ask a Grown-Up</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.gateWrap}>
        <ParentalLock onUnlock={() => navigation.navigate(ROUTES.ParentalArea)} />
      </View>

      <Modal
        visible={showUpsell}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpsell(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ready for more?</Text>
            <Text style={styles.modalBody}>
              A grown-up can unlock all the play areas and future scenes here.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowUpsell(false);
                navigation.navigate(ROUTES.ParentalArea);
              }}
              accessibilityRole="button"
              accessibilityLabel="Go to parent area"
            >
              <Text style={styles.modalButtonText}>Open Parent Area</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowUpsell(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.modalCloseText}>Keep Playing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  wrap: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACING.md,
    columnGap: SPACING.md,
  },
  card: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
    padding: SPACING.md,
  },
  cardLocked: {
    opacity: 0.65,
  },
  cardIcon: {
    fontSize: 44,
    marginBottom: SPACING.sm,
  },
  cardText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    textAlign: 'center',
  },
  lockIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    fontSize: 20,
  },
  upsell: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  upsellTitle: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  upsellBody: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  upsellButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  upsellButtonText: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#fff',
  },
  gateWrap: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.h1,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  modalButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#fff',
  },
  modalClose: {
    marginTop: SPACING.md,
  },
  modalCloseText: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textMuted,
  },
});
