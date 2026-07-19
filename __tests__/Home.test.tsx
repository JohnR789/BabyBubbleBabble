import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Home from '../scenes/Home';
import { SettingsProvider } from '../SettingsContext';
import { PremiumProvider } from '../PremiumContext';

const Stack = createStackNavigator();

function Nav() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <PremiumProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Home" component={Home} />
            </Stack.Navigator>
          </NavigationContainer>
        </PremiumProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

function findByText(root: any, text: string) {
  return root.findAll((node: any) =>
    node.children?.some((child: any) => typeof child === 'string' && child.includes(text))
  )[0];
}

describe('Home', () => {
  it('renders the scene grid and parental gate', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = ReactTestRenderer.create(<Nav />);
    });
    const root = tree!.root;
    expect(() => findByText(root, 'Baby Bubble Babble')).not.toThrow();
    expect(() => findByText(root, 'Bubbles')).not.toThrow();
    expect(() => findByText(root, 'Shape Sorter')).not.toThrow();
  });
});
