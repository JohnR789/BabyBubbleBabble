import type { ParamListBase } from '@react-navigation/native';

export type AppParamList = {
  Home: undefined;
  BubbleScene: undefined;
  BallScene: undefined;
  AnimalParadeScene: undefined;
  NightSkyScene: undefined;
  PeekabooScene: undefined;
  PondScene: undefined;
  StackingScene: undefined;
  ShapeSorterScene: undefined;
  ParentalArea: undefined;
};

export type NavigationProp<T extends ParamListBase> = {
  navigate: (name: keyof T & string) => void;
  goBack: () => void;
};
