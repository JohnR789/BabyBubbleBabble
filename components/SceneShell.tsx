import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppParamList } from '../types';
import { ROUTES } from '../constants';
import MusicManager from '../utils/MusicManager';
import ParentalLock from './ParentalLock';
import Celebration from './Celebration';

interface SceneShellProps {
  children: React.ReactNode;
  backgroundColor?: string;
  safeArea?: boolean;
  celebrate?: boolean;
  celebrationMessage?: string;
}

export default function SceneShell({ children, backgroundColor = '#f6f7ff', safeArea = true, celebrate = false, celebrationMessage = 'Great job!' }: SceneShellProps) {
  const navigation = useNavigation<StackNavigationProp<AppParamList>>();
  const insets = useSafeAreaInsets();

  const backgroundStyle = { backgroundColor };
  const containerStyle = [styles.container, backgroundStyle];
  const lockBottom = safeArea ? 16 : insets.bottom + 16;
  const lockWrapStyle = [styles.lockWrap, { bottom: lockBottom }];

  const content = (
    <View style={containerStyle}>
      <MusicManager />
      <View style={styles.stage}>{children}</View>
      <Celebration visible={celebrate} message={celebrationMessage} />
      <View style={lockWrapStyle}>
        <ParentalLock onUnlock={() => navigation.navigate(ROUTES.ParentalArea)} />
      </View>
    </View>
  );

  if (safeArea) {
    return (
      <SafeAreaView style={containerStyle}>
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
