import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ParentalArea from '../ParentalArea';
import { SettingsProvider } from '../SettingsContext';
import { PremiumProvider } from '../PremiumContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createStackNavigator();

function Nav() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <PremiumProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="ParentalArea" component={ParentalArea} />
            </Stack.Navigator>
          </NavigationContainer>
        </PremiumProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

function findByText(root: any, text: string) {
  return root.findAll((node: any) => node.children?.some((child: any) => typeof child === 'string' && child.includes(text)))[0];
}

describe('ParentalArea', () => {
  it('renders settings and premium controls', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = ReactTestRenderer.create(<Nav />);
    });
    const root = tree!.root;
    expect(() => findByText(root, 'Parental Controls')).not.toThrow();
    expect(() => findByText(root, 'Background music')).not.toThrow();
    expect(() => findByText(root, 'Premium')).not.toThrow();
    expect(() => findByText(root, 'Subscribe monthly')).not.toThrow();
    expect(() => findByText(root, 'Restore purchases')).not.toThrow();
  });
});
