// contexts/AudioContextProvider.js
import React, { createContext, useRef, useEffect } from 'react';

export const AudioContextContext = createContext(null);

const AudioContextProvider = ({ children }) => {
  const audioCtxRef = useRef(null);

  useEffect(() => {
    // Function to initialize/resume AudioContext
    const initializeAudioContext = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext initialized');
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().then(() => {
          console.log('AudioContext resumed');
        });
      }

      // Remove event listeners after initialization
      window.removeEventListener('click', initializeAudioContext);
      window.removeEventListener('touchstart', initializeAudioContext);
    };

    // Listen for the first user interaction to initialize AudioContext
    window.addEventListener('click', initializeAudioContext, { once: true });
    window.addEventListener('touchstart', initializeAudioContext, { once: true });

    return () => {
      window.removeEventListener('click', initializeAudioContext);
      window.removeEventListener('touchstart', initializeAudioContext);
    };
  }, []);

  return (
    <AudioContextContext.Provider value={audioCtxRef.current}>
      {children}
    </AudioContextContext.Provider>
  );
};

export default AudioContextProvider;
