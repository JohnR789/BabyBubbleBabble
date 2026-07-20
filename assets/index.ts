/**
 * Central asset registry for the Montessori play areas.
 *
 * Metro can only bundle static `require()` calls that are written literally
 * in the source. This file is the single place where every image and sound is
 * required, so scenes never scatter dynamic or duplicated asset imports.
 */

export const IMAGES = {
  scenes: {
    pouring: require('./images/scenes/pouring.png'),
    colorSort: require('./images/scenes/color_sort.png'),
    soundCylinders: require('./images/scenes/sound_cylinders.png'),
    letterGarden: require('./images/scenes/letter_garden.png'),
    counting: require('./images/scenes/counting.png'),
    flowerArrange: require('./images/scenes/flower_arrange.png'),
    buttonFrame: require('./images/scenes/button_frame.png'),
    puzzleMap: require('./images/scenes/puzzle_map.png'),
    shapeTrace: require('./images/scenes/shape_trace.png'),
    spoonTransfer: require('./images/scenes/spoon_transfer.png'),
  },
};

export const SOUNDS = {
  effects: {
    pop: require('./sounds/effects/pop.mp3'),
    snap: require('./sounds/effects/snap.mp3'),
    plop: require('./sounds/effects/plop.mp3'),
    scoop: require('./sounds/effects/scoop.mp3'),
    waterPour: require('./sounds/effects/water_pour.mp3'),
    rattle: require('./sounds/effects/rattle.mp3'),
    bell: require('./sounds/effects/bell.mp3'),
    drum: require('./sounds/effects/drum.mp3'),
    success: require('./sounds/effects/success.mp3'),
  },
  music: {
    ambient: require('./sounds/music/ambient.mp3'),
  },
};

export const IMAGE_LICENSES: Record<string, string> = {
  'scenes/pouring.png': 'AI-generated for this project',
  'scenes/color_sort.png': 'AI-generated for this project',
  'scenes/sound_cylinders.png': 'AI-generated for this project',
  'scenes/letter_garden.png': 'AI-generated for this project',
  'scenes/counting.png': 'AI-generated for this project',
  'scenes/flower_arrange.png': 'AI-generated for this project',
  'scenes/button_frame.png': 'AI-generated for this project',
  'scenes/puzzle_map.png': 'AI-generated for this project',
  'scenes/shape_trace.png': 'AI-generated for this project',
  'scenes/spoon_transfer.png': 'AI-generated for this project',
};

export const AUDIO_LICENSES: Record<string, string> = {
  'effects/pop.mp3': 'Generated for this project',
  'effects/snap.mp3': 'Generated for this project',
  'effects/plop.mp3': 'Generated for this project',
  'effects/scoop.mp3': 'Generated for this project',
  'effects/water_pour.mp3': 'Generated for this project',
  'effects/rattle.mp3': 'Generated for this project',
  'effects/bell.mp3': 'Generated for this project',
  'effects/drum.mp3': 'Generated for this project',
  'effects/success.mp3': 'Generated for this project',
  'music/ambient.mp3': 'Generated for this project',
};
