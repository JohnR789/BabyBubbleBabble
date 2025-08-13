import React, { useEffect } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Peekaboo from '../components/Peekaboo';
import ParentalLock from '../components/ParentalLock';
import { playGiggleSound } from '../utils/SoundManager';
import MusicManager from '../utils/MusicManager';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const PEEK_IMAGES = [
  require('../assets/images/icons/sun.png'),
  require('../assets/images/icons/cloud.png'),
  require('../assets/images/animals/bunny.png'),
];

export default function PeekabooScene() {
  const navigation = useNavigation();
  const [current, setCurrent] = React.useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(Math.floor(Math.random() * PEEK_IMAGES.length));
    }, 2100);
    return () => clearInterval(interval);
  }, []);

  function handlePeek() {
    playGiggleSound();
  }

  return (
    <View style={styles.container}>
      <MusicManager />
      <Peekaboo
        x={width / 2 - 54}
        y={height / 2 - 54}
        img={PEEK_IMAGES[current]}
        onPeek={handlePeek}
      />
      <ParentalLock onUnlock={() => navigation.navigate('ParentalArea')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf3fa',
  },
});


