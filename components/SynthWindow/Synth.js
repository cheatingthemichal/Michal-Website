// components/Synth.js
import React, { useState, useEffect, useRef } from 'react';
import { List, Modal, Button } from '@react95/core';
import { Mmsys120 } from '@react95/icons';
import styled from 'styled-components';
import Controls from './Controls';
import VirtualKeyboard from './VirtualKeyboard';
import { Instructions, Container } from './styles';

// Styled Components specific to Synth.js
const ToggleButton = styled(Button)`
  margin-top: 10px;
  align-self: center;
`;

const Synth = ({ onClose, position }) => {
  // State variables
  const [waveform, setWaveform] = useState('sine');
  const [additiveMode, setAdditiveMode] = useState('off');
  const [numPartials, setNumPartials] = useState(50);
  const [distPartials, setDistPartials] = useState(50);
  const [amMode, setAmMode] = useState('off');
  const [amFrequency, setAmFrequency] = useState(250);
  const [fmMode, setFmMode] = useState('off');
  const [fmFrequency, setFmFrequency] = useState(250);
  const [lfoMode, setLfoMode] = useState('off');
  const [lfoFrequency, setLfoFrequency] = useState(5);
  const [crazy, setCrazy] = useState(false); // New state for crazy mode
  const [showKeyboard, setShowKeyboard] = useState(false); // State to toggle keyboard visibility
  const [distortedFmIntensity, setDistortedFmIntensity] = useState(0); // New state for distorted FM intensity

  // Refs for AudioContext and active oscillators/gains
  const audioCtxRef = useRef(null);
  const compressorRef = useRef(null);
  const activeOscillatorsRef = useRef({});
  const activeGainsRef = useRef({});

  // Define the list of keys for the virtual keyboard with correct keyCodes
  const keys = [
    { note: 'C4', frequency: 261.63, type: 'white', keyCode: '90' }, // Z
    { note: 'C#4', frequency: 277.18, type: 'black', keyCode: '83' }, // S
    { note: 'D4', frequency: 293.66, type: 'white', keyCode: '88' }, // X
    { note: 'D#4', frequency: 311.13, type: 'black', keyCode: '68' }, // D
    { note: 'E4', frequency: 329.63, type: 'white', keyCode: '67' }, // C
    { note: 'F4', frequency: 349.23, type: 'white', keyCode: '86' }, // V
    { note: 'F#4', frequency: 369.99, type: 'black', keyCode: '71' }, // G
    { note: 'G4', frequency: 391.99, type: 'white', keyCode: '66' }, // B
    { note: 'G#4', frequency: 415.3, type: 'black', keyCode: '72' }, // H
    { note: 'A4', frequency: 440, type: 'white', keyCode: '78' }, // N
    { note: 'A#4', frequency: 466.16, type: 'black', keyCode: '74' }, // J
    { note: 'B4', frequency: 493.88, type: 'white', keyCode: '77' }, // M
    { note: 'C5', frequency: 523.25, type: 'white', keyCode: '81' }, // Q
    { note: 'C#5', frequency: 554.37, type: 'black', keyCode: '50' }, // 2
    { note: 'D5', frequency: 587.33, type: 'white', keyCode: '87' }, // W
    { note: 'D#5', frequency: 622.25, type: 'black', keyCode: '51' }, // 3
    { note: 'E5', frequency: 659.26, type: 'white', keyCode: '69' }, // E
    { note: 'F5', frequency: 698.46, type: 'white', keyCode: '82' }, // R
    { note: 'F#5', frequency: 739.99, type: 'black', keyCode: '53' }, // 5
    { note: 'G5', frequency: 783.99, type: 'white', keyCode: '84' }, // T
    { note: 'G#5', frequency: 830.61, type: 'black', keyCode: '54' }, // 6
    { note: 'A5', frequency: 880, type: 'white', keyCode: '89' }, // Y
    { note: 'A#5', frequency: 932.33, type: 'black', keyCode: '55' }, // 7
    { note: 'B5', frequency: 987.77, type: 'white', keyCode: '85' }, // U
    { note: 'C6', frequency: 1046.5, type: 'white', keyCode: '73' }, // I
  ];

  // Frequency map for physical keyboard using keyCode as strings
  const keyboardFrequencyMap = keys.reduce((acc, key) => {
    acc[key.keyCode] = key.frequency;
    return acc;
  }, {});

  // Initialize AudioContext and Compressor
  useEffect(() => {
    // Initialize AudioContext
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const audioCtx = audioCtxRef.current;

    // Create Global Gain Node
    const globalGain = audioCtx.createGain();
    globalGain.connect(audioCtx.destination);

    // Create Compressor and connect to Global Gain
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
    // You can adjust compressor settings here if needed
    compressor.connect(globalGain);
    compressorRef.current = compressor;

    // Event listeners for keyboard
    const handleKeyDown = (event) => {
      const keyCode = event.keyCode.toString();
      if (keyboardFrequencyMap[keyCode] && !activeOscillatorsRef.current[keyCode]) {
        if (crazy) {
          playCrazy();
        } else {
          playNote(
            keyCode,
            keyboardFrequencyMap[keyCode],
            additiveMode === 'on' ? parseInt(numPartials) : 1,
            additiveMode === 'on' ? parseInt(distPartials) : 0,
            amMode === 'on' ? parseFloat(amFrequency) : 0,
            fmMode === 'on' ? parseFloat(fmFrequency) : 0,
            lfoMode === 'on' ? parseFloat(lfoFrequency) : 0
          );
        }
      }
    };

    const handleKeyUp = (event) => {
      const keyCode = event.keyCode.toString();
      if (keyboardFrequencyMap[keyCode] && activeOscillatorsRef.current[keyCode]) {
        stopNote(keyCode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      audioCtx.close();
    };
  }, [
    waveform,
    additiveMode,
    numPartials,
    distPartials,
    amMode,
    amFrequency,
    fmMode,
    fmFrequency,
    lfoMode,
    lfoFrequency,
    crazy,
    keyboardFrequencyMap,
  ]);

  // Function to play a note
  const playNote = (
    key,
    frequency,
    numPartials,
    distPartials,
    amFreq,
    fmFreq,
    lfoFreq
  ) => {
    const audioCtx = audioCtxRef.current;

    // Initialize arrays for oscillators and gains if not present
    activeOscillatorsRef.current[key] = [];
    activeGainsRef.current[key] = [];

    // Create oscillators for each partial
    const oscillators = [];
    for (let i = 0; i < numPartials; i++) {
      const osc = audioCtx.createOscillator();
      osc.frequency.setValueAtTime(frequency + i * distPartials, audioCtx.currentTime);
      osc.type = waveform; // Use the current waveform state
      oscillators.push(osc);
      activeOscillatorsRef.current[key].push(osc);
    }

    // Create Gain Node for the main signal
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.1); // Fade in
    oscillators.forEach((osc) => {
      osc.connect(gainNode);
      osc.start();
    });

    // Connect Gain Node to Compressor
    if (compressorRef.current) {
      gainNode.connect(compressorRef.current);
    } else {
      gainNode.connect(audioCtx.destination);
    }

    // Store Gain Node
    activeGainsRef.current[key].push(gainNode);

    // AM Modulation
    if (amFreq > 0) {
      const amMod = audioCtx.createOscillator();
      amMod.frequency.value = amFreq;

      const amGain = audioCtx.createGain();
      amGain.gain.value = 0.5; // Modulation depth for AM

      amMod.connect(amGain);
      amGain.connect(gainNode.gain); // Modulate the gainNode's gain

      amMod.start();

      activeOscillatorsRef.current[key].push(amMod);
      activeGainsRef.current[key].push(amGain);
    }

    // FM Modulation (Correct Implementation)
    if (fmFreq > 0 && fmMode === 'on') {
      const fmMod = audioCtx.createOscillator();
      fmMod.frequency.value = fmFreq;

      const fmGain = audioCtx.createGain();
      fmGain.gain.value = 100; // Modulation index for FM

      fmMod.connect(fmGain);
      // Modulate the frequency of each oscillator
      oscillators.forEach((osc) => {
        fmGain.connect(osc.frequency);
      });

      fmMod.start();

      activeOscillatorsRef.current[key].push(fmMod);
      activeGainsRef.current[key].push(fmGain);
    }

    // Distorted FM Modulation (Old Implementation)
    if (fmFreq > 0 && distortedFmIntensity > 0 && fmMode === 'on') {
      const distortedFmMod = audioCtx.createOscillator();
      distortedFmMod.frequency.value = fmFreq;

      const distortedFmGain = audioCtx.createGain();
      distortedFmGain.gain.value = 100 * distortedFmIntensity; // Scaled by intensity

      distortedFmMod.connect(distortedFmGain).connect(audioCtx.destination);
      distortedFmMod.start();

      activeOscillatorsRef.current[key].push(distortedFmMod);
      activeGainsRef.current[key].push(distortedFmGain);
    }

    // LFO Modulation
    if (lfoFreq > 0) {
      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = lfoFreq;

      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 0.5; // Modulation depth for LFO

      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain); // Modulate the gainNode's gain

      lfo.start();

      activeOscillatorsRef.current[key].push(lfo);
      activeGainsRef.current[key].push(lfoGain);
    }
  };

  // Function to stop a note
  const stopNote = (key) => {
    const audioCtx = audioCtxRef.current;
    const gainNodes = activeGainsRef.current[key] || [];
    const oscillators = activeOscillatorsRef.current[key] || [];

    gainNodes.forEach((gainNode) => {
      gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3); // Fade out
    });

    oscillators.forEach((osc) => {
      try {
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        // Oscillator might have already been stopped
      }
    });

    delete activeGainsRef.current[key];
    delete activeOscillatorsRef.current[key];
  };

  // Function to shuffle an array
  const shuffleArray = (array) => {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  };

  // Function to play a crazy note
  const playCrazy = () => {
    const audioCtx = audioCtxRef.current;
    const whiteKeysList = keys.filter((key) => key.type === 'white'); // Prefer white keys for crazy mode
    const shuffledKeys = shuffleArray([...whiteKeysList]);
    const selectedKey = shuffledKeys[0]; // Pick the first key after shuffle

    if (selectedKey) {
      const virtualKey = `virtual-${selectedKey.note}`;
      if (!activeOscillatorsRef.current[virtualKey]) {
        // Play the selected key with current settings
        playNote(
          virtualKey,
          selectedKey.frequency,
          additiveMode === 'on' ? numPartials : 1,
          additiveMode === 'on' ? distPartials : 0,
          amMode === 'on' ? amFrequency : 0,
          fmMode === 'on' ? fmFrequency : 0,
          lfoMode === 'on' ? lfoFrequency : 0
        );

        // Schedule stopping the note after a short duration
        setTimeout(() => {
          stopNote(virtualKey);
        }, 300); // 300ms duration
      }
    }
  };

  const handleVirtualKeyDown = (key) => {
    if (crazy) {
      playCrazy();
    } else {
      const virtualKey = `virtual-${key.note}`;
      if (!activeOscillatorsRef.current[virtualKey]) {
        playNote(
          virtualKey,
          key.frequency,
          additiveMode === 'on' ? numPartials : 1,
          additiveMode === 'on' ? distPartials : 0,
          amMode === 'on' ? amFrequency : 0,
          fmMode === 'on' ? fmFrequency : 0,
          lfoMode === 'on' ? lfoFrequency : 0
        );
      }
    }
  };

  // Function to handle virtual key release
  const handleVirtualKeyUp = (key) => {
    const virtualKey = `virtual-${key.note}`;
    if (activeOscillatorsRef.current[virtualKey]) {
      stopNote(virtualKey);
    }
  };

  return (
    <Modal
      closeModal={onClose}
      style={{
        width: '600px',
        height: 'auto',
        left: position.x,
        top: position.y,
        maxWidth: '90%',
        maxHeight: '90%',
        overflow: 'auto',
        zIndex: 1000,
      }}
      icon={<Mmsys120 variant="32x32_4" />}
      title="MySynthesizer.exe"
      menu={[
        {
          name: 'Options',
          list: (
            <List width="200px">
              <List.Item onClick={onClose}>Close</List.Item>
            </List>
          ),
        },
      ]}
    >
      <Container>
        {/* Controls */}
        <Controls
          waveform={waveform}
          setWaveform={setWaveform}
          additiveMode={additiveMode}
          setAdditiveMode={setAdditiveMode}
          numPartials={numPartials}
          setNumPartials={setNumPartials}
          distPartials={distPartials}
          setDistPartials={setDistPartials}
          amMode={amMode}
          setAmMode={setAmMode}
          amFrequency={amFrequency}
          setAmFrequency={setAmFrequency}
          fmMode={fmMode}
          setFmMode={setFmMode}
          fmFrequency={fmFrequency}
          setFmFrequency={setFmFrequency}
          lfoMode={lfoMode}
          setLfoMode={setLfoMode}
          lfoFrequency={lfoFrequency}
          setLfoFrequency={setLfoFrequency}
          crazy={crazy}
          setCrazy={setCrazy}
          distortedFmIntensity={distortedFmIntensity}
          setDistortedFmIntensity={setDistortedFmIntensity}
        />

        {/* Instructions */}
        <Instructions>
          Press keys (Z, S, X, D, C, V, G, B, H, N, J, M, Q, 2, W, 3, E, R, 5, T, 6, Y, 7, U, I) to play notes.
        </Instructions>

        {/* Toggle Virtual Keyboard Button */}
        <ToggleButton onClick={() => setShowKeyboard(!showKeyboard)}>
          {showKeyboard ? 'Hide Virtual Keyboard' : 'Show Virtual Keyboard'}
        </ToggleButton>

        {/* Virtual Keyboard */}
        {showKeyboard && (
          <VirtualKeyboard
            keys={keys}
            handleVirtualKeyDown={handleVirtualKeyDown}
            handleVirtualKeyUp={handleVirtualKeyUp}
            activeOscillators={activeOscillatorsRef.current}
          />
        )}
      </Container>
    </Modal>
  );
};

export default Synth;
