import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AnimalSoundsScene from '../scenes/AnimalSoundsScene';

const Stack = createStackNavigator();

function Nav() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="AnimalSoundsScene" component={AnimalSoundsScene} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function findByText(root: any, text: string) {
  return root.findAll((node: any) =>
    node.children?.some((child: any) => typeof child === 'string' && child.includes(text))
  )[0];
}

describe('AnimalSoundsScene', () => {
  it('renders the animal sound matching cards', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = ReactTestRenderer.create(<Nav />);
    });
    const root = tree!.root;
    expect(() => findByText(root, 'Tap an animal to hear its sound')).not.toThrow();
    expect(() => findByText(root, 'Duck')).not.toThrow();
    expect(() => findByText(root, 'Cow')).not.toThrow();
  });
});
