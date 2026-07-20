import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Home from '../scenes/Home';
import { SettingsProvider } from '../SettingsContext';
import { PremiumProvider } from '../PremiumContext';
import { SCENES } from '../constants';

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

function textMatches(node: any, text: string) {
  const children = node.children;
  if (typeof children === 'string') return children.includes(text);
  if (Array.isArray(children)) {
    return children.some((child: any) => typeof child === 'string' && child.includes(text));
  }
  return false;
}

function findByText(root: any, text: string) {
  const found = root.findAll((node: any) => textMatches(node, text))[0];
  if (!found) {
    throw new Error(`Text "${text}" not found`);
  }
  return found;
}

describe('Home', () => {
  it('renders the scene grid and parental gate', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = ReactTestRenderer.create(<Nav />);
    });
    const root = tree!.root;
    expect(() => findByText(root, 'Baby Bubble Babble')).not.toThrow();
    expect(() => findByText(root, 'Pouring')).not.toThrow();
    expect(() => findByText(root, 'Color Sort')).not.toThrow();
    expect(() => findByText(root, 'Parental Area (Tap 5x)')).not.toThrow();
  });

  it('lists every configured scene', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = ReactTestRenderer.create(<Nav />);
    });
    const root = tree!.root;
    for (const scene of SCENES) {
      expect(() => findByText(root, scene.label)).not.toThrow();
    }
  });
});
