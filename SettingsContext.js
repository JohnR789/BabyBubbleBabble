import React, { createContext, useState } from 'react';

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [musicOn, setMusicOn] = useState(true);
  const [currentScene, setCurrentScene] = useState('BubbleScene');
  const [colorMode, setColorMode] = useState('default'); // night, high-contrast, etc.

  return (
    <SettingsContext.Provider value={{
      musicOn,
      setMusicOn,
      currentScene,
      setCurrentScene,
      colorMode,
      setColorMode,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}
