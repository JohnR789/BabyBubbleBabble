import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './scenes/Home';
import BubbleScene from './scenes/BubbleScene';
import BallScene from './scenes/BallScene';
import AnimalParadeScene from './scenes/AnimalParadeScene';
import NightSkyScene from './scenes/NightSkyScene';
import PeekabooScene from './scenes/PeekabooScene';
import PondScene from './scenes/PondScene';
import StackingScene from './scenes/StackingScene';
import ParentalArea from './ParentalArea';

import { SettingsProvider } from './SettingsContext';
import { PremiumProvider } from './PremiumContext';
import { COLORS } from './theme';
import type { AppParamList } from './types';

const Stack = createStackNavigator<AppParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <PremiumProvider>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: true,
                headerTitleAlign: 'center',
                headerStyle: { backgroundColor: COLORS.background },
                headerTintColor: COLORS.text,
              }}
            >
              <Stack.Screen name="Home" component={Home} options={{ title: 'Baby Bubble Babble' }} />
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
          </PremiumProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
