import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './scenes/Home';
import PouringScene from './scenes/PouringScene';
import ColorSortScene from './scenes/ColorSortScene';
import SoundMatchScene from './scenes/SoundMatchScene';
import LetterGardenScene from './scenes/LetterGardenScene';
import CountingScene from './scenes/CountingScene';
import FlowerArrangeScene from './scenes/FlowerArrangeScene';
import ButtonFrameScene from './scenes/ButtonFrameScene';
import PuzzleMapScene from './scenes/PuzzleMapScene';
import ShapeTraceScene from './scenes/ShapeTraceScene';
import SpoonTransferScene from './scenes/SpoonTransferScene';
import ParentalArea from './ParentalArea';

import { SettingsProvider } from './SettingsContext';
import { PremiumProvider } from './PremiumContext';
import { COLORS } from './theme';
import type { AppParamList } from './types';

const Stack = createStackNavigator<AppParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
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
                <Stack.Screen name="PouringScene" options={{ title: 'Pouring' }} component={PouringScene} />
                <Stack.Screen name="ColorSortScene" options={{ title: 'Color Sort' }} component={ColorSortScene} />
                <Stack.Screen name="SoundMatchScene" options={{ title: 'Sound Match' }} component={SoundMatchScene} />
                <Stack.Screen name="LetterGardenScene" options={{ title: 'Letter Garden' }} component={LetterGardenScene} />
                <Stack.Screen name="CountingScene" options={{ title: 'Counting' }} component={CountingScene} />
                <Stack.Screen name="FlowerArrangeScene" options={{ title: 'Flower Arrange' }} component={FlowerArrangeScene} />
                <Stack.Screen name="ButtonFrameScene" options={{ title: 'Button Frame' }} component={ButtonFrameScene} />
                <Stack.Screen name="PuzzleMapScene" options={{ title: 'Puzzle Map' }} component={PuzzleMapScene} />
                <Stack.Screen name="ShapeTraceScene" options={{ title: 'Shape Trace' }} component={ShapeTraceScene} />
                <Stack.Screen name="SpoonTransferScene" options={{ title: 'Spoon Transfer' }} component={SpoonTransferScene} />
                <Stack.Screen name="ParentalArea" options={{ title: 'Parents' }} component={ParentalArea} />
              </Stack.Navigator>
            </NavigationContainer>
          </PremiumProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: { flex: 1 },
});
