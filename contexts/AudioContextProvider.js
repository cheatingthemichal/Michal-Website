// contexts/AudioContextProvider.js
import React, { createContext, useContext, useEffect, useRef } from 'react';

const AudioContextContext = createContext(null);

export const AudioContextProvider = ({ children }) => {
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    audioContextRef.current = new AudioContextConstructor();

    // Create Master Gain Node
    masterGainRef.current = audioContextRef.current.createGain();
    masterGainRef.current.gain.value = 1.0; // Set master volume as needed

    // Create Analyser Node
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048; // Default FFT size

    // Connect Master Gain to Analyser and Destination
    masterGainRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <AudioContextContext.Provider value={{ audioContext: audioContextRef.current, masterGain: masterGainRef.current, analyser: analyserRef.current }}>
      {children}
    </AudioContextContext.Provider>
  );
};

export const useAudioContext = () => {
  return useContext(AudioContextContext);
};
