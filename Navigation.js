import { createStackNavigator } from '@react-navigation/stack';
import BubbleScene from './scenes/BubbleScene';
import BallScene from './scenes/BallScene';
import AnimalParadeScene from './scenes/AnimalParadeScene';
import NightSkyScene from './scenes/NightSkyScene';
import PondScene from './scenes/PondScene';
import StackingScene from './scenes/StackingScene';
import PeekabooScene from './scenes/PeekabooScene';
import ParentalArea from './ParentalArea';

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BubbleScene" component={BubbleScene} />
      <Stack.Screen name="BallScene" component={BallScene} />
      <Stack.Screen name="AnimalParadeScene" component={AnimalParadeScene} />
      <Stack.Screen name="NightSkyScene" component={NightSkyScene} />
      <Stack.Screen name="PondScene" component={PondScene} />
      <Stack.Screen name="StackingScene" component={StackingScene} />
      <Stack.Screen name="PeekabooScene" component={PeekabooScene} />
      <Stack.Screen name="ParentalArea" component={ParentalArea} />
    </Stack.Navigator>
  );
}
