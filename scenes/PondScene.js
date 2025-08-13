import React, { useState } from 'react';
import { View, TouchableWithoutFeedback, Image, StyleSheet } from 'react-native';
import ParentalLock from '../components/ParentalLock';
import { playPopSound } from '../utils/SoundManager';
import MusicManager from '../utils/MusicManager';
import { useNavigation } from '@react-navigation/native';

export default function PondScene() {
  const [frog, setFrog] = useState(false);
  const navigation = useNavigation();

  function handleTouch(evt) {
    const { locationX, locationY } = evt.nativeEvent;
    setFrog({ x: locationX, y: locationY });
    playPopSound();
    setTimeout(() => setFrog(false), 1200);
  }

  return (
    <View style={styles.container}>
      <MusicManager />
      <TouchableWithoutFeedback onPress={handleTouch}>
        <View style={styles.flex}>
          {frog && (
            <Image
              source={require('../assets/images/animals/frog.png')}
              style={[
                styles.frog,
                { left: frog.x - 36, top: frog.y - 36 }
              ]}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
      <ParentalLock onUnlock={() => navigation.navigate('ParentalArea')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5e6f9',
  },
  flex: {
    flex: 1,
  },
  frog: {
    position: 'absolute',
    width: 72,
    height: 72,
    zIndex: 2,
  },
});

