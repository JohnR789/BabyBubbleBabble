// ParentalArea.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function ParentalArea() {
  return (
    <View style={styles.c}>
      <Text>Parental controls go here.</Text>
    </View>
  );
}
const styles = StyleSheet.create({ c: { flex: 1, alignItems: 'center', justifyContent: 'center' }});
