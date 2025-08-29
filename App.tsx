// App.tsx
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './scenes/Home';

// scenes
import BubbleScene from './scenes/BubbleScene';
import BallScene from './scenes/BallScene';
import AnimalParadeScene from './scenes/AnimalParadeScene';
import NightSkyScene from './scenes/NightSkyScene';
import PeekabooScene from './scenes/PeekabooScene';
import PondScene from './scenes/PondScene';
import StackingScene from './scenes/StackingScene';

// parental area
import ParentalArea from './ParentalArea';

import { SettingsProvider } from './SettingsContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{ headerShown: true, headerTitleAlign: 'center' }}
            >
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="BubbleScene" options={{ title: 'Bubbles' }} component={BubbleScene} />
              <Stack.Screen name="BallScene" options={{ title: 'Balls' }} component={BallScene} />
              <Stack.Screen name="AnimalParadeScene" options={{ title: 'Animal Parade' }} component={AnimalParadeScene} />
              <Stack.Screen name="NightSkyScene" options={{ title: 'Night Sky' }} component={NightSkyScene} />
              <Stack.Screen name="PeekabooScene" options={{ title: 'Peekaboo' }} component={PeekabooScene} />
              <Stack.Screen name="PondScene" options={{ title: 'Pond' }} component={PondScene} />
              <Stack.Screen name="StackingScene" options={{ title: 'Stacking' }} component={StackingScene} />
              <Stack.Screen name="ParentalArea" options={{ title: 'Parents' }} component={ParentalArea} />
            </Stack.Navigator>
          </NavigationContainer>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

