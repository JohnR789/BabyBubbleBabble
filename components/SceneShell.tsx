import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppParamList } from '../types';
import { ROUTES } from '../constants';
import MusicManager from '../utils/MusicManager';
import ParentalLock from './ParentalLock';

interface SceneShellProps {
  children: React.ReactNode;
  backgroundColor?: string;
  safeArea?: boolean;
}

export default function SceneShell({ children, backgroundColor = '#f6f7ff', safeArea = true }: SceneShellProps) {
  const navigation = useNavigation<StackNavigationProp<AppParamList>>();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.container, { backgroundColor }]}>
      <MusicManager />
      <View style={styles.stage}>{children}</View>
      <View style={[styles.lockWrap, { bottom: safeArea ? 16 : insets.bottom + 16 }]}>
        <ParentalLock onUnlock={() => navigation.navigate(ROUTES.ParentalArea)} />
      </View>
    </View>
  );

  if (safeArea) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        {content}
      </SafeAreaView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } satisfies ViewStyle,
  stage: {
    flex: 1,
  } satisfies ViewStyle,
  lockWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  } satisfies ViewStyle,
});
