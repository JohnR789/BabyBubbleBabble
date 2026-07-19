import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ShapeSorterScene from '../scenes/ShapeSorterScene';

const Stack = createStackNavigator();

function Nav() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="ShapeSorterScene" component={ShapeSorterScene} />
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

describe('ShapeSorterScene', () => {
  it('renders the Montessori shape-matching scene', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = ReactTestRenderer.create(<Nav />);
    });
    const root = tree!.root;
    expect(() => findByText(root, 'Match each shape to its spot')).not.toThrow();
    expect(() => findByText(root, 'circle')).not.toThrow();
    expect(() => findByText(root, 'square')).not.toThrow();
  });
});
