// context/AudioContextProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AudioContextContext = createContext(null);

export const AudioContextProvider = ({ children }) => {
  const [audioContext, setAudioContext] = useState(null);

  const initAudioContext = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
    } else if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  };

  // Add event listeners for user interactions to initialize the AudioContext
  useEffect(() => {
    const handleUserInteraction = () => {
      initAudioContext();
      // Remove event listeners after initialization
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [audioContext]);

  return (
    <AudioContextContext.Provider value={audioContext}>
      {children}
    </AudioContextContext.Provider>
  );
};

export const useSharedAudioContext = () => {
  return useContext(AudioContextContext);
};
