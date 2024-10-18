// context/AudioContextProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AudioContextContext = createContext(null);

export const AudioContextProvider = ({ children }) => {
  const [audioContext, setAudioContext] = useState(null);

  const initAudioContext = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
      console.log('AudioContext initialized');
    } else if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('AudioContext resumed');
      }).catch((e) => {
        console.error('AudioContext resume failed:', e);
      });
    }
  };

  // Add event listeners for user interactions to initialize and resume the AudioContext
  useEffect(() => {
    const handleUserInteraction = () => {
      initAudioContext();
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction); // Ensure touchstart is handled
      window.removeEventListener('touchend', handleUserInteraction);   // Ensure touchend is handled
    };

    window.addEventListener('pointerdown', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });
    window.addEventListener('touchstart', handleUserInteraction, { once: true });
    window.addEventListener('touchend', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('touchend', handleUserInteraction);
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
