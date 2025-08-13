import { Audio } from 'expo-av';

let sounds = {};

// Static mapping of animal sounds to required assets
const animalSounds = {
  duck_quack: require('../assets/sounds/animal_sounds/duck.mp3'),
  sheep_baa: require('../assets/sounds/animal_sounds/sheep.wav'),
  frog_ribbit: require('../assets/sounds/animal_sounds/frog.mp3'),
  horse: require('../assets/sounds/animal_sounds/horse.wav'),
  cow: require('../assets/sounds/animal_sounds/cow.wav'),
};

export async function playPopSound() {
  if (!sounds.pop) {
    sounds.pop = new Audio.Sound();
    try {
      await sounds.pop.loadAsync(require('../assets/sounds/pops/pop1.mp3'));
      await sounds.pop.playAsync();
    } catch (error) {
      console.warn('Error playing pop sound:', error);
    }
  } else {
    try {
      await sounds.pop.stopAsync();
      await sounds.pop.playAsync();
    } catch (error) {
      console.warn('Error replaying pop sound:', error);
    }
  }
}

export async function playGiggleSound() {
  if (!sounds.giggle) {
    sounds.giggle = new Audio.Sound();
    try {
      await sounds.giggle.loadAsync(require('../assets/sounds/giggles/giggle1.mp3'));
      await sounds.giggle.playAsync();
    } catch (error) {
      console.warn('Error playing giggle sound:', error);
    }
  } else {
    try {
      await sounds.giggle.stopAsync();
      await sounds.giggle.playAsync();
    } catch (error) {
      console.warn('Error replaying giggle sound:', error);
    }
  }
}

export async function playAnimalSound(name) {
  const soundFile = animalSounds[name];
  if (!soundFile) {
    console.warn(`Animal sound not found: ${name}`);
    return;
  }

  if (!sounds[name]) {
    sounds[name] = new Audio.Sound();
    try {
      await sounds[name].loadAsync(soundFile);
      await sounds[name].playAsync();
    } catch (error) {
      console.warn(`Failed to load/play sound for ${name}:`, error);
    }
  } else {
    try {
      await sounds[name].stopAsync();
      await sounds[name].playAsync();
    } catch (error) {
      console.warn(`Error replaying sound for ${name}:`, error);
    }
  }
}
