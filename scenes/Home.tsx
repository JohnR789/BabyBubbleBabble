import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppParamList } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
import { SCENES, ROUTES } from '../constants';
import ParentalLock from '../components/ParentalLock';

type HomeNavigationProp = StackNavigationProp<AppParamList, typeof ROUTES.Home>;

function SceneCard({ route, label, icon }: { route: string; label: string; icon: string }) {
  const navigation = useNavigation<HomeNavigationProp>();
  const index = SCENES.findIndex((s) => s.route === route);
  const tint = COLORS.pastels[index % COLORS.pastels.length];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: tint }]}
      onPress={() => navigation.navigate(route as keyof AppParamList & string)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${label}`}
      activeOpacity={0.8}
    >
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function Home() {
  const navigation = useNavigation<HomeNavigationProp>();

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Baby Bubble Babble</Text>
      <Text style={styles.subtitle}>A gentle world for little fingers</Text>

      <View style={styles.grid}>
        {SCENES.map((scene) => (
          <SceneCard key={scene.route} route={scene.route} label={scene.label} icon={scene.icon} />
        ))}
      </View>

      <View style={styles.gateWrap}>
        <ParentalLock onUnlock={() => navigation.navigate(ROUTES.ParentalArea)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    backgroundColor: COLORS.background,
    minHeight: '100%',
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
  gateWrap: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
});
