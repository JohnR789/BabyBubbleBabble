import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './Navigation';
import { SettingsProvider } from './SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </SettingsProvider>
  );
}
