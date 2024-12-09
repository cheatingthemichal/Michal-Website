// components/Synth.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { List, Modal, Button } from '@react95/core';
import { Mmsys120 } from '@react95/icons';
import styled from 'styled-components';
import Controls from './Controls';
import VirtualKeyboard from './VirtualKeyboard';
import { Instructions, Container } from './styles';
import { useSharedAudioContext } from '../../context/AudioContextProvider';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'; 
import useIsMobile from '../../hooks/useIsMobile';

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  align-self: center;
  justify-content: center;
`;

const ToggleButton = styled(Button)`
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
`;

const KEYS = [
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

const maxPartials = 50; 

const Synth = ({ onClose, position }) => {
  const isMobile = useIsMobile();
  const [silentAudio, setSilentAudio] = useState(null);
  const [waveform, setWaveform] = useState('sine');
  const [pulseWidth, setPulseWidth] = useState(0.5);
  const [additiveMode, setAdditiveMode] = useState('off');
  const [numPartials, setNumPartials] = useState(50);
  const [distPartials, setDistPartials] = useState(50);
  const [amMode, setAmMode] = useState('off');
  const [amFrequency, setAmFrequency] = useState(250);
  const [fmMode, setFmMode] = useState('off');
  const [fmFrequency, setFmFrequency] = useState(250);
  const [lfoMode, setLfoMode] = useState('off');
  const [lfoFrequency, setLfoFrequency] = useState(5);
  const [crazy, setCrazy] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isTwoRows, setIsTwoRows] = useState(false);
  const [distortedFmIntensity, setDistortedFmIntensity] = useState(0);
  const [volume, setVolume] = useState(1);
  const [octaveShift, setOctaveShift] = useState(0);

  // New state for tracking currently focused slider
  // Assume sliderName is a string that identifies which slider is focused
  const [focusedSlider, setFocusedSlider] = useState(null);

  const activeOscillatorsRef = useRef({});
  const activeGainsRef = useRef({});
  const compressorRef = useRef(null);
  const masterGainRef = useRef(null);

  const audioContext = useSharedAudioContext();

  const parametersRef = useRef({
    waveform,
    pulseWidth,
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
    distortedFmIntensity,
    octaveShift,
    volume,
  });

  useEffect(() => {
    if (isMobile && audioContext) {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      const silentAudioElement = new Audio('/silence.mp3');
      silentAudioElement.loop = true;
      silentAudioElement.volume = 0;
      silentAudioElement.play().catch((e) => {
        console.log('Error playing silent audio:', e);
      });

      setSilentAudio(silentAudioElement);

      return () => {
        silentAudioElement.pause();
        silentAudioElement.remove();
        setSilentAudio(null);
      };
    }
  }, [isMobile, audioContext]);

  useEffect(() => {
    parametersRef.current = {
      waveform,
      pulseWidth,
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
      distortedFmIntensity,
      octaveShift,
      volume,
    };

    const {
      waveform: currentWaveform,
      pulseWidth: currentPulseWidth,
      additiveMode: currentAddMode,
      numPartials: currentNumPartials,
      distPartials: currentDistPartials,
      amMode: currentAmMode,
      amFrequency: currentAmFreq,
      fmMode: currentFmMode,
      fmFrequency: currentFmFreq,
      lfoMode: currentLfoMode,
      lfoFrequency: currentLfoFreq,
      distortedFmIntensity: currentDistortedFmIntensity,
      volume: currentVolume,
    } = parametersRef.current;

    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(currentVolume, audioContext.currentTime);
    }

    // Smooth updates to currently playing notes...
    Object.keys(activeOscillatorsRef.current).forEach((key) => {
      const oscData = activeOscillatorsRef.current[key];
      const gainData = activeGainsRef.current[key];
      const { baseFrequency, partialOscillators, partialGains } = oscData;

      // Update partial frequencies
      partialOscillators.forEach((osc, i) => {
        const targetFreq = baseFrequency + i * (currentAddMode === 'on' ? currentDistPartials : 0);
        osc.frequency.cancelScheduledValues(audioContext.currentTime);
        osc.frequency.setValueAtTime(osc.frequency.value, audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(targetFreq, audioContext.currentTime + 0.1);

        if (currentWaveform === 'pulse') {
          updatePulseWave(osc, currentPulseWidth);
        } else {
          osc.type = currentWaveform;
        }
      });

      // Update number of partials smoothly
      const effectiveNumPartials = (currentAddMode === 'on') ? currentNumPartials : 1;
      partialGains.forEach((pGain, i) => {
        const targetGain = i < effectiveNumPartials ? 1 : 0;
        pGain.gain.cancelScheduledValues(audioContext.currentTime);
        pGain.gain.setValueAtTime(pGain.gain.value, audioContext.currentTime);
        pGain.gain.linearRampToValueAtTime(targetGain, audioContext.currentTime + 0.1);
      });

      // AM
      if (oscData.amMod && gainData.amGain) {
        oscData.amMod.frequency.setValueAtTime(currentAmFreq, audioContext.currentTime);
        const amTargetGain = currentAmMode === 'on' ? 0.5 : 0;
        gainData.amGain.gain.cancelScheduledValues(audioContext.currentTime);
        gainData.amGain.gain.setValueAtTime(gainData.amGain.gain.value, audioContext.currentTime);
        gainData.amGain.gain.linearRampToValueAtTime(amTargetGain, audioContext.currentTime + 0.1);
      }

      // FM
      if (oscData.fmMod && gainData.fmGain) {
        oscData.fmMod.frequency.setValueAtTime(currentFmFreq, audioContext.currentTime);
        const fmTargetGain = currentFmMode === 'on' ? 100 : 0;
        gainData.fmGain.gain.cancelScheduledValues(audioContext.currentTime);
        gainData.fmGain.gain.setValueAtTime(gainData.fmGain.gain.value, audioContext.currentTime);
        gainData.fmGain.gain.linearRampToValueAtTime(fmTargetGain, audioContext.currentTime + 0.1);
      }

      // Distorted FM
      if (oscData.distortedFmMod && gainData.distortedFmGain) {
        oscData.distortedFmMod.frequency.setValueAtTime(currentFmFreq, audioContext.currentTime);
        const distortedFmTargetGain = currentFmMode === 'on' ? (100 * currentDistortedFmIntensity) : 0;
        gainData.distortedFmGain.gain.cancelScheduledValues(audioContext.currentTime);
        gainData.distortedFmGain.gain.setValueAtTime(gainData.distortedFmGain.gain.value, audioContext.currentTime);
        gainData.distortedFmGain.gain.linearRampToValueAtTime(distortedFmTargetGain, audioContext.currentTime + 0.1);
      }

      // LFO
      if (oscData.lfo && gainData.lfoGain) {
        oscData.lfo.frequency.setValueAtTime(currentLfoFreq, audioContext.currentTime);
        const lfoTargetGain = currentLfoMode === 'on' ? 0.5 : 0;
        gainData.lfoGain.gain.cancelScheduledValues(audioContext.currentTime);
        gainData.lfoGain.gain.setValueAtTime(gainData.lfoGain.gain.value, audioContext.currentTime);
        gainData.lfoGain.gain.linearRampToValueAtTime(lfoTargetGain, audioContext.currentTime + 0.1);
      }
    });
  }, [
    waveform,
    pulseWidth,
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
    distortedFmIntensity,
    octaveShift,
    volume,
    audioContext,
  ]);

  const shiftedKeys = useMemo(() => {
    const factor = Math.pow(2, octaveShift);
    return KEYS.map((key) => ({
      ...key,
      frequency: key.frequency * factor,
    }));
  }, [octaveShift]);

  const keyboardFrequencyMap = useMemo(() => {
    return shiftedKeys.reduce((acc, key) => {
      acc[key.keyCode] = key.frequency;
      return acc;
    }, {});
  }, [shiftedKeys]);

  const createPulseOscillator = (audioCtx, frequency, pulseWidth) => {
    const osc = audioCtx.createOscillator();
    const pulseShaper = audioCtx.createWaveShaper();

    const createPulseCurve = (pw) => {
      const curves = new Float32Array(256);
      for (let i = 0; i < 128; i++) {
        curves[i] = i < 128 * pw ? -1 : 1;
      }
      for (let i = 128; i < 256; i++) {
        curves[i] = i < 128 + 128 * pw ? 1 : -1;
      }
      return curves;
    };

    pulseShaper.curve = createPulseCurve(pulseWidth);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.connect(pulseShaper);

    return { osc, pulseShaper };
  };

  const updatePulseWave = (osc, pulseWidth) => {
    if (osc.pulseShaper) {
      const curves = new Float32Array(256);
      for (let i = 0; i < 128; i++) {
        curves[i] = i < 128 * pulseWidth ? -1 : 1;
      }
      for (let i = 128; i < 256; i++) {
        curves[i] = i < 128 + 128 * pulseWidth ? 1 : -1;
      }
      osc.pulseShaper.curve = curves;
    }
  };

  useEffect(() => {
    if (audioContext && !compressorRef.current) {
      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(volume, audioContext.currentTime);
      masterGain.connect(audioContext.destination);
      masterGainRef.current = masterGain;

      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, audioContext.currentTime);
      compressor.connect(masterGain);
      compressorRef.current = compressor;
      console.log('Compressor and Master Gain initialized');

      const handleKeyDown = (event) => {
        const currentParams = parametersRef.current;
        const keyCode = event.keyCode.toString();

        // If a slider is focused and arrow keys are pressed:
        if (focusedSlider && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
          event.preventDefault();
          // Increment or decrement the slider value by 1
          // We'll handle logic depending on which slider is focused
          // Example logic: if focusedSlider === 'numPartials', adjust numPartials
          const increment = (event.key === 'ArrowUp') ? 1 : -1;

          // Update the appropriate parameter
          switch (focusedSlider) {
            case 'numPartials':
              setNumPartials((prev) => Math.max(1, prev + increment));
              break;
            case 'distPartials':
              setDistPartials((prev) => Math.max(0, prev + increment));
              break;
            case 'amFrequency':
              setAmFrequency((prev) => Math.max(0, prev + increment));
              break;
            case 'fmFrequency':
              setFmFrequency((prev) => Math.max(0, prev + increment));
              break;
            case 'lfoFrequency':
              setLfoFrequency((prev) => Math.max(0, prev + increment));
              break;
            case 'distortedFmIntensity':
              setDistortedFmIntensity((prev) => Math.max(0, prev + increment));
              break;
            case 'volume':
              // volume 0 to 1 range, increment by 0.01 or 1? 
              // If you want whole increments, maybe clamp at 0 to 1?
              // Let's assume increment by 0.01 for fine control:
              setVolume((prev) => Math.min(1, Math.max(0, prev + increment * 0.01)));
              break;
            // Add other sliders as needed
            default:
              break;
          }
          return; // Prevent also triggering note logic
        }

        // Keyboard note logic
        if (keyboardFrequencyMap[keyCode] && !activeOscillatorsRef.current[keyCode]) {
          if (currentParams.crazy) {
            playCrazy();
          } else {
            playNote(
              keyCode,
              keyboardFrequencyMap[keyCode],
              currentParams
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

      const handleTouchStart = async (event) => {
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        const key = event.target.dataset.note;
        if (key) handleVirtualKeyDown({ note: key });
      };

      const handleTouchEnd = (event) => {
        const key = event.target.dataset.note;
        if (key) handleVirtualKeyUp({ note: key });
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [audioContext, keyboardFrequencyMap, focusedSlider, volume]);

  const playNote = (
    key,
    frequency,
    currentParams
  ) => {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    if (audioContext.state !== 'running') {
      console.log('AudioContext not running');
      return;
    }

    const {
      waveform,
      pulseWidth,
      additiveMode,
      numPartials,
      distPartials,
      amMode,
      amFrequency,
      fmMode,
      fmFrequency,
      lfoMode,
      lfoFrequency,
      distortedFmIntensity
    } = currentParams;

    if (!activeOscillatorsRef.current[key]) {
      activeOscillatorsRef.current[key] = {
        mainOscillators: [],
        partialOscillators: [],
        partialGains: [],
        amMod: null,
        fmMod: null,
        distortedFmMod: null,
        lfo: null,
        baseFrequency: frequency
      };
    }

    if (!activeGainsRef.current[key]) {
      activeGainsRef.current[key] = {
        gainNodes: [],
        amGain: null,
        fmGain: null,
        distortedFmGain: null,
        lfoGain: null,
      };
    }

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.1);

    const partialOscillators = [];
    const partialGains = [];
    const effectiveNumPartials = additiveMode === 'on' ? numPartials : 1; 

    for (let i = 0; i < maxPartials; i++) {
      let osc;
      const oscFrequency = frequency + i * (additiveMode === 'on' ? distPartials : 0);
      if (waveform === 'pulse') {
        const { osc: pulseOsc, pulseShaper } = createPulseOscillator(
          audioContext,
          oscFrequency,
          pulseWidth
        );
        osc = pulseOsc;
        osc.pulseShaper = pulseShaper;
      } else {
        osc = audioContext.createOscillator();
        osc.type = waveform;
        osc.frequency.setValueAtTime(oscFrequency, audioContext.currentTime);
      }

      const pGain = audioContext.createGain();
      pGain.gain.setValueAtTime(i < effectiveNumPartials ? 1 : 0, audioContext.currentTime);

      if (waveform === 'pulse') {
        osc.pulseShaper.connect(pGain).connect(gainNode);
      } else {
        osc.connect(pGain).connect(gainNode);
      }

      osc.start();
      partialOscillators.push(osc);
      partialGains.push(pGain);
    }

    activeOscillatorsRef.current[key].partialOscillators = partialOscillators;
    activeOscillatorsRef.current[key].partialGains = partialGains;
    activeOscillatorsRef.current[key].mainOscillators = partialOscillators;

    if (compressorRef.current) {
      gainNode.connect(compressorRef.current);
    } else if (masterGainRef.current) {
      gainNode.connect(masterGainRef.current);
    }
    activeGainsRef.current[key].gainNodes.push(gainNode);

    // AM
    const amMod = audioContext.createOscillator();
    amMod.frequency.value = amFrequency || 0;
    const amGain = audioContext.createGain();
    amGain.gain.value = amMode === 'on' ? 0.5 : 0;
    amMod.connect(amGain).connect(gainNode.gain);
    amMod.start();
    activeOscillatorsRef.current[key].amMod = amMod;
    activeGainsRef.current[key].amGain = amGain;

    // FM
    const fmMod = audioContext.createOscillator();
    fmMod.frequency.value = fmFrequency || 0;
    const fmGain = audioContext.createGain();
    fmGain.gain.value = fmMode === 'on' ? 100 : 0;
    fmMod.connect(fmGain);
    partialOscillators.forEach((osc) => fmGain.connect(osc.frequency));
    fmMod.start();
    activeOscillatorsRef.current[key].fmMod = fmMod;
    activeGainsRef.current[key].fmGain = fmGain;

    // Distorted FM
    const distortedFmMod = audioContext.createOscillator();
    distortedFmMod.frequency.value = fmFrequency || 0;
    const distortedFmGain = audioContext.createGain();
    distortedFmGain.gain.value = fmMode === 'on' ? (100 * distortedFmIntensity) : 0;
    distortedFmMod.connect(distortedFmGain).connect(audioContext.destination);
    distortedFmMod.start();
    activeOscillatorsRef.current[key].distortedFmMod = distortedFmMod;
    activeGainsRef.current[key].distortedFmGain = distortedFmGain;

    // LFO
    const lfo = audioContext.createOscillator();
    lfo.frequency.value = lfoFrequency || 0;
    const lfoGain = audioContext.createGain();
    lfoGain.gain.value = lfoMode === 'on' ? 0.5 : 0;
    lfo.connect(lfoGain).connect(gainNode.gain);
    lfo.start();
    activeOscillatorsRef.current[key].lfo = lfo;
    activeGainsRef.current[key].lfoGain = lfoGain;
  };

  const stopNote = (key) => {
    if (!audioContext) return;

    const gainNodes = activeGainsRef.current[key]?.gainNodes || [];
    const { amMod, fmMod, distortedFmMod, lfo, partialOscillators } = activeOscillatorsRef.current[key] || {};
    const { amGain, fmGain, distortedFmGain, lfoGain } = activeGainsRef.current[key] || {};

    gainNodes.forEach((gainNode) => {
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
    });

    if (amMod && amGain) {
      amGain.gain.cancelScheduledValues(audioContext.currentTime);
      amGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
      amMod.stop(audioContext.currentTime + 0.3);
    }

    if (fmMod && fmGain) {
      fmGain.gain.cancelScheduledValues(audioContext.currentTime);
      fmGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
      fmMod.stop(audioContext.currentTime + 0.3);
    }

    if (distortedFmMod && distortedFmGain) {
      distortedFmGain.gain.cancelScheduledValues(audioContext.currentTime);
      distortedFmGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
      distortedFmMod.stop(audioContext.currentTime + 0.3);
    }

    if (lfo && lfoGain) {
      lfoGain.gain.cancelScheduledValues(audioContext.currentTime);
      lfoGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
      lfo.stop(audioContext.currentTime + 0.3);
    }

    if (partialOscillators) {
      partialOscillators.forEach((osc) => {
        try {
          osc.stop(audioContext.currentTime + 0.3);
        } catch (e) {}
      });
    }

    delete activeGainsRef.current[key];
    delete activeOscillatorsRef.current[key];
  };

  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const playCrazy = () => {
    if (!audioContext) return;

    const currentParams = parametersRef.current;
    const whiteKeysList = KEYS.filter((key) => key.type === 'white');
    const shuffledKeys = shuffleArray([...whiteKeysList]);
    const selectedKey = shuffledKeys[0];

    if (selectedKey) {
      const virtualKey = `virtual-${selectedKey.note}`;
      if (!activeOscillatorsRef.current[virtualKey]) {
        playNote(
          virtualKey,
          selectedKey.frequency,
          currentParams
        );
        setTimeout(() => {
          stopNote(virtualKey);
        }, 300);
      }
    }
  };

  const handleVirtualKeyDown = async (key) => {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    const currentParams = parametersRef.current;
    if (currentParams.crazy) {
      playCrazy();
    } else {
      const virtualKey = `virtual-${key.note}`;
      if (!activeOscillatorsRef.current[virtualKey]) {
        playNote(
          virtualKey,
          key.frequency,
          currentParams
        );
      }
    }
  };

  const handleVirtualKeyUp = (key) => {
    const virtualKey = `virtual-${key.note}`;
    if (activeOscillatorsRef.current[virtualKey]) {
      stopNote(virtualKey);
    }
  };

  const handleOctaveDown = () => {
    setOctaveShift((prev) => Math.max(prev - 1, -1));
  };

  const handleOctaveUp = () => {
    setOctaveShift((prev) => Math.min(prev + 1, 1));
  };

  // Callback for when a slider in Controls gets focused
  const handleSliderFocus = (sliderName) => {
    setFocusedSlider(sliderName);
  };

  // Callback for when a slider loses focus
  const handleSliderBlur = () => {
    setFocusedSlider(null);
  };

  // Callback to set slider values programmatically if needed
  const handleChangeSliderValue = (sliderName, newValue) => {
    switch (sliderName) {
      case 'numPartials':
        setNumPartials(newValue);
        break;
      case 'distPartials':
        setDistPartials(newValue);
        break;
      case 'amFrequency':
        setAmFrequency(newValue);
        break;
      case 'fmFrequency':
        setFmFrequency(newValue);
        break;
      case 'lfoFrequency':
        setLfoFrequency(newValue);
        break;
      case 'distortedFmIntensity':
        setDistortedFmIntensity(newValue);
        break;
      case 'volume':
        setVolume(newValue);
        break;
      default:
        break;
    }
  };

  return (
    <Modal
      closeModal={onClose}
      style={{
        width: '700px',
        height: 'auto',
        left: position.x,
        top: position.y,
        maxWidth: '95%',
        maxHeight: '95%',
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
        <Controls
          waveform={waveform}
          setWaveform={setWaveform}
          pulseWidth={pulseWidth}
          setPulseWidth={setPulseWidth}
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
          volume={volume}
          setVolume={setVolume}
          // New props for slider focus handling and programmatic updates
          onSliderFocus={handleSliderFocus}
          onSliderBlur={handleSliderBlur}
          onChangeSliderValue={handleChangeSliderValue}
        />

        <Instructions>
          Press keys (Z, S, X, D, C, V, G, B, H, N, J, M, Q, 2, W, 3, E, R, 5, T, 6, Y, 7, U, I) to play notes.
          <br />
          Click and hold on a slider to focus it. While focused, use Up/Down arrow keys to change its value by 1.
        </Instructions>

        <ButtonContainer>
          <ToggleButton
            onClick={handleOctaveDown}
            disabled={octaveShift <= -1}
            title="Shift down by one octave"
            aria-label="Shift down by one octave"
          >
            <FaArrowDown style={{ marginRight: '5px' }} />
            Octave Down
          </ToggleButton>

          <ToggleButton onClick={() => setShowKeyboard(!showKeyboard)}>
            {showKeyboard ? 'Hide Virtual Keyboard' : 'Show Virtual Keyboard'}
          </ToggleButton>

          {showKeyboard && (
            <ToggleButton onClick={() => setIsTwoRows(!isTwoRows)}>
              {isTwoRows ? 'Make One Row' : 'Make Two Rows'}
            </ToggleButton>
          )}

          <ToggleButton
            onClick={handleOctaveUp}
            disabled={octaveShift >= 1}
            title="Shift up by one octave"
            aria-label="Shift up by one octave"
          >
            <FaArrowUp style={{ marginRight: '5px' }} />
            Octave Up
          </ToggleButton>
        </ButtonContainer>

        {showKeyboard && (
          <VirtualKeyboard
            keys={shiftedKeys}
            handleVirtualKeyDown={handleVirtualKeyDown}
            handleVirtualKeyUp={handleVirtualKeyUp}
            activeOscillators={activeOscillatorsRef.current}
            isTwoRows={isTwoRows}
          />
        )}
      </Container>
    </Modal>
  );
};

export default Synth;
