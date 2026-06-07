// ParentalArea.js
import React, { useContext } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SettingsContext } from './SettingsContext';

export default function ParentalArea({ navigation }) {
  const { musicOn, setMusicOn } = useContext(SettingsContext);

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Parental Controls</Text>

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.label}>Background music</Text>
          <Text style={styles.hint}>Soft lullabies that loop while playing.</Text>
        </View>
        <Switch
          value={!!musicOn}
          onValueChange={setMusicOn}
          accessibilityLabel="Toggle background music"
        />
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>About this app</Text>
        <Text style={styles.noteText}>
          Baby Bubble Babble is a gentle sensory playground for infants and
          toddlers. Tap bubbles, balls, animals and more to hear soft sounds.
          There are no ads, purchases, or links out of the app.
        </Text>
      </View>

      {navigation ? (
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
    padding: 20,
    gap: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  rowText: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  note: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  button: {
    marginTop: 'auto',
    backgroundColor: '#5cb8ff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
