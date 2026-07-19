import type { ParamListBase } from '@react-navigation/native';

export type AppParamList = {
  Home: undefined;
  PouringScene: undefined;
  ColorSortScene: undefined;
  SoundMatchScene: undefined;
  LetterGardenScene: undefined;
  CountingScene: undefined;
  FlowerArrangeScene: undefined;
  ButtonFrameScene: undefined;
  PuzzleMapScene: undefined;
  ShapeTraceScene: undefined;
  SpoonTransferScene: undefined;
  ParentalArea: undefined;
};

export type NavigationProp<T extends ParamListBase> = {
  navigate: (name: keyof T & string) => void;
  goBack: () => void;
};
