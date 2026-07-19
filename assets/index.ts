/**
 * Central asset registry.
 *
 * Metro can only bundle static `require()` calls that are written literally
 * in the source. This file is the single place where every image and sound is
 * required, so scenes never scatter dynamic or duplicated asset imports.
 */

export const IMAGES = {
  animals: {
    bunny: require('./images/animals/bunny.png'),
    cow: require('./images/animals/cow.png'),
    duck: require('./images/animals/duck.png'),
    frog: require('./images/animals/frog.png'),
    horse: require('./images/animals/horse.png'),
    sheep: require('./images/animals/sheep.png'),
  },
  balls: {
    ball1: require('./images/balls/ball1.png'),
  },
  blocks: {
    red: require('./images/blocks/block_red.png'),
    blue: require('./images/blocks/block_blue.png'),
    green: require('./images/blocks/block_green.png'),
    yellow: require('./images/blocks/block_yellow.png'),
    purple: require('./images/blocks/block_purple.png'),
    pink: require('./images/blocks/block_pink.png'),
  },
  bubbles: {
    bubble1: require('./images/bubbles/bubble1.png'),
  },
  icons: {
    cloud: require('./images/icons/cloud.png'),
    firefly: require('./images/icons/firefly.png'),
    sun: require('./images/icons/sun.png'),
  },
};

export const SOUNDS = {
  pops: {
    pop1: require('./sounds/pops/pop1.mp3'),
    pop2: require('./sounds/pops/pop2.mp3'),
    pop3: require('./sounds/pops/pop3.mp3'),
  },
  giggles: {
    giggle1: require('./sounds/giggles/giggle1.mp3'),
  },
  animalSounds: {
    duck: require('./sounds/animal_sounds/duck.mp3'),
    sheep: require('./sounds/animal_sounds/sheep.wav'),
    frog: require('./sounds/animal_sounds/frog.mp3'),
    horse: require('./sounds/animal_sounds/horse.wav'),
    cow: require('./sounds/animal_sounds/cow.wav'),
    bunny: require('./sounds/animal_sounds/bunny.mp3'),
  },
  effects: {
    bounce: require('./sounds/effects/bounce.mp3'),
    splash: require('./sounds/effects/splash.mp3'),
    snap: require('./sounds/effects/snap.mp3'),
    clack: require('./sounds/effects/clack.mp3'),
    chime: require('./sounds/effects/chime.mp3'),
  },
  music: {
    TinyToes: require('./sounds/music/TinyToes.mp3'),
    SunnyDays: require('./sounds/music/SunnyDays.mp3'),
    SunnyDayParade: require('./sounds/music/SunnyDayParade.mp3'),
    TwinkleTickleToes: require('./sounds/music/TwinkleTickleToes.mp3'),
    HappyDayParade: require('./sounds/music/HappyDayParade.mp3'),
    TwinkleToes: require('./sounds/music/TwinkleToes.mp3'),
    SunnyDaysandSillyWays: require('./sounds/music/SunnyDaysandSillyWays.mp3'),
    SkippingDreams: require('./sounds/music/SkippingDreams.mp3'),
    BubbleBounce: require('./sounds/music/BubbleBounce.mp3'),
    QuackQuackPlaytime: require('./sounds/music/QuackQuackPlaytime.mp3'),
  },
};

export const IMAGE_LICENSES: Record<string, string> = {
  'animals/bunny.png': 'repository-owned / generated placeholder',
  'animals/cow.png': 'repository-owned / generated placeholder',
  'animals/duck.png': 'repository-owned / generated placeholder',
  'animals/frog.png': 'repository-owned / generated placeholder',
  'animals/horse.png': 'repository-owned / generated placeholder',
  'animals/sheep.png': 'repository-owned / generated placeholder',
  'balls/ball1.png': 'repository-owned / generated placeholder',
  'blocks/block_red.png': 'repository-owned / generated placeholder',
  'blocks/block_blue.png': 'repository-owned / generated placeholder',
  'blocks/block_green.png': 'repository-owned / generated placeholder',
  'blocks/block_yellow.png': 'repository-owned / generated placeholder',
  'blocks/block_purple.png': 'repository-owned / generated placeholder',
  'blocks/block_pink.png': 'repository-owned / generated placeholder',
  'bubbles/bubble1.png': 'repository-owned / generated placeholder',
  'icons/cloud.png': 'repository-owned / generated placeholder',
  'icons/firefly.png': 'repository-owned / generated placeholder',
  'icons/sun.png': 'repository-owned / generated placeholder',
};

export const AUDIO_LICENSES: Record<string, string> = {
  'pops/pop1.mp3': 'repository-owned / generated placeholder',
  'giggles/giggle1.mp3': 'repository-owned / generated placeholder',
  'animal_sounds/duck.mp3': 'repository-owned / generated placeholder',
  'animal_sounds/sheep.wav': 'repository-owned / generated placeholder',
  'animal_sounds/frog.mp3': 'repository-owned / generated placeholder',
  'animal_sounds/horse.wav': 'repository-owned / generated placeholder',
  'animal_sounds/cow.wav': 'repository-owned / generated placeholder',
  'animal_sounds/bunny.mp3': 'repository-owned / generated placeholder',
  'pops/pop2.mp3': 'repository-owned / generated placeholder',
  'pops/pop3.mp3': 'repository-owned / generated placeholder',
  'effects/bounce.mp3': 'repository-owned / generated placeholder',
  'effects/splash.mp3': 'repository-owned / generated placeholder',
  'effects/snap.mp3': 'repository-owned / generated placeholder',
  'effects/clack.mp3': 'repository-owned / generated placeholder',
  'effects/chime.mp3': 'repository-owned / generated placeholder',
  'music/TinyToes.mp3': 'repository-owned / generated placeholder',
  'music/SunnyDays.mp3': 'repository-owned / generated placeholder',
  'music/SunnyDayParade.mp3': 'repository-owned / generated placeholder',
  'music/TwinkleTickleToes.mp3': 'repository-owned / generated placeholder',
  'music/HappyDayParade.mp3': 'repository-owned / generated placeholder',
  'music/TwinkleToes.mp3': 'repository-owned / generated placeholder',
  'music/SunnyDaysandSillyWays.mp3': 'repository-owned / generated placeholder',
  'music/SkippingDreams.mp3': 'repository-owned / generated placeholder',
  'music/BubbleBounce.mp3': 'repository-owned / generated placeholder',
  'music/QuackQuackPlaytime.mp3': 'repository-owned / generated placeholder',
};
