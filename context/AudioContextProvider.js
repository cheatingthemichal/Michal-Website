// context/AudioContextProvider.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AudioContextContext = createContext(null);

export const AudioContextProvider = ({ children }) => {
  const [audioContext, setAudioContext] = useState(null);
  const contextRef = useRef(null);
  const isInitializingRef = useRef(false);

  const initAudioContext = () => {
    // Prevent multiple initializations
    if (isInitializingRef.current) {
      return;
    }
    
    if (!contextRef.current) {
      isInitializingRef.current = true;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        contextRef.current = ctx;
        setAudioContext(ctx);
        console.log('AudioContext initialized');
      } catch (error) {
        console.error('Failed to create AudioContext:', error);
      } finally {
        isInitializingRef.current = false;
      }
    } else if (contextRef.current.state === 'suspended') {
      contextRef.current.resume().then(() => {
        console.log('AudioContext resumed');
      }).catch((e) => {
        console.error('AudioContext resume failed:', e);
      });
    }
  };

  useEffect(() => {
    let hasInteracted = false;
    
    const handleUserInteraction = () => {
      if (!hasInteracted) {
        hasInteracted = true;
        initAudioContext();
        
        // Remove listeners after first interaction
        window.removeEventListener('pointerdown', handleUserInteraction);
        window.removeEventListener('keydown', handleUserInteraction);
        window.removeEventListener('touchstart', handleUserInteraction);
        window.removeEventListener('touchend', handleUserInteraction);
        window.removeEventListener('click', handleUserInteraction);
      }
    };

    window.addEventListener('pointerdown', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    window.addEventListener('touchend', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('touchend', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (contextRef.current && contextRef.current.state !== 'closed') {
        contextRef.current.close();
      }
    };
  }, []);

  return (
    <AudioContextContext.Provider value={audioContext}>
      {children}
    </AudioContextContext.Provider>
  );
};

export const useSharedAudioContext = () => {
  return useContext(AudioContextContext);
};