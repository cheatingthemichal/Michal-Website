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

  // In AudioContextProvider.js
useEffect(() => {
  const handleUserInteraction = () => {
    initAudioContext();
    // Remove the event listeners only if AudioContext is running
    if (audioContext && audioContext.state === 'running') {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('touchend', handleUserInteraction);
    }
  };

  window.addEventListener('pointerdown', handleUserInteraction);
  window.addEventListener('keydown', handleUserInteraction);
  window.addEventListener('touchstart', handleUserInteraction);
  window.addEventListener('touchend', handleUserInteraction);

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
