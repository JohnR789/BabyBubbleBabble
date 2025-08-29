import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

type Nav = { navigate: (route: string) => void };
export default function Home({ navigation }: { navigation: Nav }) {
  const go = (route: string) => () => navigation.navigate(route);

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Baby Bubble Babble</Text>

      {[
        ['Bubble', 'BubbleScene'],
        ['Ball', 'BallScene'],
        ['Animal Parade', 'AnimalParadeScene'],
        ['Night Sky (Fireflies)', 'NightSkyScene'],
        ['Peekaboo', 'PeekabooScene'],
        ['Pond (Frog)', 'PondScene'],
        ['Stacking Blocks', 'StackingScene'],
        ['Parental Area', 'ParentalArea'],
      ].map(([label, route]) => (
        <TouchableOpacity key={route} style={styles.card} onPress={go(route)}>
          <Text style={styles.cardText}>{label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginVertical: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: { fontSize: 18, textAlign: 'center' },
});
