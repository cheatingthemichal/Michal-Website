// context/AudioContextContext.js
import React, { createContext, useContext } from 'react';

const AudioContextContext = createContext(null);

export const useAudioContext = () => {
  return useContext(AudioContextContext);
};

export default AudioContextContext;