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
import { createLowPassFilter, createHighPassFilter, createBandPassFilter } from './SubComponents/filters';

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

const MAX_VOICES = 20; 

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
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [isTwoRows, setIsTwoRows] = useState(false);
  const [distortedFmIntensity, setDistortedFmIntensity] = useState(0);
  const [volume, setVolume] = useState(1);
  const [octaveShift, setOctaveShift] = useState(0);

  const [lpFrequency, setLpFrequency] = useState(1000);
  const [hpFrequency, setHpFrequency] = useState(500);
  const [bpFrequency, setBpFrequency] = useState(1000);
  const [bpQ, setBpQ] = useState(1);

  const [focusedSlider, setFocusedSlider] = useState(null);
  const [filtersEnabled, setFiltersEnabled] = useState(true);

  // Keep track of currently pressed keys to prevent multiple voices for same key
  const keysDownRef = useRef(new Set());
  const activeVoicesRef = useRef([]);
  const voiceIdCounterRef = useRef(0);

  const compressorRef = useRef(null);
  const masterGainRef = useRef(null);
  const notesBusRef = useRef(null);

  const lowPassRef = useRef(null);
  const highPassRef = useRef(null);
  const bandPassRef = useRef(null);

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
    distortedFmIntensity,
    octaveShift,
    volume,
    lpFrequency,
    hpFrequency,
    bpFrequency,
    bpQ
  });

  const keyboardFrequencyMapRef = useRef({});

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

  // Initialize audio chain once
  useEffect(() => {
    if (audioContext && !masterGainRef.current) {
      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(volume, audioContext.currentTime);

      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, audioContext.currentTime);

      const lowPass = createLowPassFilter(audioContext, lpFrequency);
      const highPass = createHighPassFilter(audioContext, hpFrequency);
      const bandPass = createBandPassFilter(audioContext, bpFrequency, bpQ);

      const notesBus = audioContext.createGain();
      notesBus.gain.setValueAtTime(1, audioContext.currentTime);

      // Initial chain (will adjust when filtersEnabled changes)
      notesBus.connect(lowPass).connect(highPass).connect(bandPass).connect(compressor).connect(masterGain).connect(audioContext.destination);

      notesBusRef.current = notesBus;
      lowPassRef.current = lowPass;
      highPassRef.current = highPass;
      bandPassRef.current = bandPass;
      compressorRef.current = compressor;
      masterGainRef.current = masterGain;

      const handleKeyDown = (event) => {
        const currentParams = parametersRef.current;
        const keyCode = event.keyCode.toString();

        // If slider focused and arrow keys:
        if (focusedSlider && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
          event.preventDefault();
          const increment = event.key === 'ArrowUp' ? 1 : -1;
          handleArrowKeyForSlider(focusedSlider, increment);
          return;
        }

        // Normal note logic
        const frequency = keyboardFrequencyMapRef.current[keyCode];
        if (frequency) {
          // Pressing a physical key
          if (!keysDownRef.current.has(keyCode)) {
            keysDownRef.current.add(keyCode);
            triggerNote(keyCode, frequency, currentParams);
          }
        }
      };

      const handleKeyUp = (event) => {
        const keyCode = event.keyCode.toString();
        const frequency = keyboardFrequencyMapRef.current[keyCode];
        if (frequency) {
          if (keysDownRef.current.has(keyCode)) {
            keysDownRef.current.delete(keyCode);
            releaseNote(keyCode);
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [audioContext]);

  // Update parametersRef on param change
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
      distortedFmIntensity,
      octaveShift,
      volume,
      lpFrequency,
      hpFrequency,
      bpFrequency,
      bpQ
    };

    if (masterGainRef.current && audioContext) {
      masterGainRef.current.gain.setValueAtTime(volume, audioContext.currentTime);
    }

    if (lowPassRef.current && audioContext) {
      lowPassRef.current.frequency.setValueAtTime(lpFrequency, audioContext.currentTime);
    }
    if (highPassRef.current && audioContext) {
      highPassRef.current.frequency.setValueAtTime(hpFrequency, audioContext.currentTime);
    }
    if (bandPassRef.current && audioContext) {
      bandPassRef.current.frequency.setValueAtTime(bpFrequency, audioContext.currentTime);
      bandPassRef.current.Q.setValueAtTime(bpQ, audioContext.currentTime);
    }

    activeVoicesRef.current.forEach((voice) => {
      updateVoiceParams(voice, parametersRef.current);
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
    distortedFmIntensity,
    octaveShift,
    volume,
    lpFrequency,
    hpFrequency,
    bpFrequency,
    bpQ,
    audioContext,
  ]);

  // Connect or disconnect filters based on filtersEnabled
  useEffect(() => {
    if (!audioContext || !notesBusRef.current || !compressorRef.current || !masterGainRef.current) return;

    // Disconnect everything first
    try { notesBusRef.current.disconnect(); } catch(e){}
    try { lowPassRef.current.disconnect(); } catch(e){}
    try { highPassRef.current.disconnect(); } catch(e){}
    try { bandPassRef.current.disconnect(); } catch(e){}
    try { compressorRef.current.disconnect(); } catch(e){}
    try { masterGainRef.current.disconnect(); } catch(e){}

    if (filtersEnabled) {
      // notesBus -> lowPass -> highPass -> bandPass -> compressor -> masterGain -> destination
      notesBusRef.current.connect(lowPassRef.current)
        .connect(highPassRef.current)
        .connect(bandPassRef.current)
        .connect(compressorRef.current)
        .connect(masterGainRef.current)
        .connect(audioContext.destination);
    } else {
      // Bypass filters: notesBus -> compressor -> masterGain -> destination
      notesBusRef.current.connect(compressorRef.current)
        .connect(masterGainRef.current)
        .connect(audioContext.destination);
    }
  }, [filtersEnabled, audioContext]);

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

  useEffect(() => {
    keyboardFrequencyMapRef.current = keyboardFrequencyMap;
  }, [keyboardFrequencyMap]);

  const handleArrowKeyForSlider = (sliderName, increment) => {
    switch (sliderName) {
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
        setVolume((prev) => Math.min(1, Math.max(0, prev + increment * 0.01)));
        break;
      case 'lpFrequency':
        setLpFrequency((prev) => Math.max(20, Math.min(20000, prev + increment * 10)));
        break;
      case 'hpFrequency':
        setHpFrequency((prev) => Math.max(20, Math.min(20000, prev + increment * 10)));
        break;
      case 'bpFrequency':
        setBpFrequency((prev) => Math.max(20, Math.min(20000, prev + increment * 10)));
        break;
      case 'bpQ':
        setBpQ((prev) => Math.max(0.1, Math.min(100, prev + increment * 0.1)));
        break;
      default:
        break;
    }
  };

  const createPulseOscillator = (audioCtx, frequency, pw) => {
    const osc = audioCtx.createOscillator();
    const pulseShaper = audioCtx.createWaveShaper();
    const createPulseCurve = (width) => {
      const curves = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        curves[i] = i < 256 * width ? -1 : 1;
      }
      return curves;
    };
    pulseShaper.curve = createPulseCurve(pw);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.connect(pulseShaper);
    return { osc, pulseShaper };
  };

  const updatePulseWave = (osc, pulseWidth) => {
    if (!osc.pulseShaper) return;
    const curves = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      curves[i] = i < 256 * pulseWidth ? -1 : 1;
    }
    osc.pulseShaper.curve = curves;
  };

  const triggerNote = (id, frequency, currentParams) => {
    if (!audioContext || audioContext.state === 'suspended') return;

    // Enforce polyphony limit
    if (activeVoicesRef.current.length >= MAX_VOICES) {
      const oldestVoice = activeVoicesRef.current.shift();
      if (oldestVoice) {
        stopVoice(oldestVoice);
      }
    }

    const voiceId = voiceIdCounterRef.current++;
    const voice = createVoice(voiceId, frequency, currentParams);
    voice.keyId = id; 
    activeVoicesRef.current.push(voice);
    startVoice(voice);
  };

  const releaseNote = (id) => {
    // Find the voice with given keyId
    const index = activeVoicesRef.current.findIndex((v) => v.keyId === id);
    if (index !== -1) {
      const voice = activeVoicesRef.current.splice(index, 1)[0];
      stopVoice(voice);
    }
  };

  const createVoice = (voiceId, frequency, params) => {
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
    } = params;

    const voice = {
      id: voiceId,
      baseFrequency: frequency,
      partialOscillators: [],
      amOsc: null,
      fmOsc: null,
      distortedFmOsc: null,
      lfoOsc: null,
      gainNode: audioContext.createGain(),
      amGain: audioContext.createGain(),
      fmGain: audioContext.createGain(),
      distortedFmGain: audioContext.createGain(),
      lfoGain: audioContext.createGain(),
      partialGains: []
    };

    voice.gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    const effectiveNumPartials = (additiveMode === 'on') ? Math.min(numPartials, 50) : 1;
    for (let i = 0; i < effectiveNumPartials; i++) {
      let osc;
      const oscFreq = frequency + i * (additiveMode === 'on' ? distPartials : 0);
      if (waveform === 'pulse') {
        const { osc: pulseOsc, pulseShaper } = createPulseOscillator(audioContext, oscFreq, pulseWidth);
        osc = pulseOsc;
        osc.pulseShaper = pulseShaper;
      } else {
        osc = audioContext.createOscillator();
        osc.type = waveform;
        osc.frequency.setValueAtTime(oscFreq, audioContext.currentTime);
      }
      const pGain = audioContext.createGain();
      pGain.gain.setValueAtTime(1, audioContext.currentTime);
      if (waveform === 'pulse') {
        osc.pulseShaper.connect(pGain).connect(voice.gainNode);
      } else {
        osc.connect(pGain).connect(voice.gainNode);
      }
      voice.partialOscillators.push(osc);
      voice.partialGains.push(pGain);
    }

    // AM
    voice.amOsc = audioContext.createOscillator();
    voice.amOsc.frequency.value = amFrequency;
    voice.amGain.gain.value = (amMode === 'on') ? 0.5 : 0;
    voice.amOsc.connect(voice.amGain).connect(voice.gainNode.gain);

    // FM
    voice.fmOsc = audioContext.createOscillator();
    voice.fmOsc.frequency.value = fmFrequency;
    voice.fmGain.gain.value = (fmMode === 'on') ? 100 : 0;

    // Distorted FM
    voice.distortedFmOsc = audioContext.createOscillator();
    voice.distortedFmOsc.frequency.value = fmFrequency;
    voice.distortedFmGain.gain.value = (fmMode === 'on') ? (100 * distortedFmIntensity) : 0;

    // Connect FM to frequencies
    voice.fmOsc.connect(voice.fmGain).connect(voice.partialOscillators[0].frequency);
    voice.distortedFmOsc.connect(voice.distortedFmGain).connect(voice.partialOscillators[0].frequency);     

    // Distorted FM connected directly to destination (creates the bass effect)
    voice.distortedFmOsc.connect(voice.distortedFmGain).connect(audioContext.destination);

    // LFO
    voice.lfoOsc = audioContext.createOscillator();
    voice.lfoOsc.frequency.value = lfoFrequency;
    voice.lfoGain.gain.value = (lfoMode === 'on') ? 0.5 : 0;
    voice.lfoOsc.connect(voice.lfoGain).connect(voice.gainNode.gain);

    return voice;
  };

  const startVoice = (voice) => {
    voice.partialOscillators.forEach((osc) => osc.start());
    voice.amOsc.start();
    voice.fmOsc.start();
    voice.distortedFmOsc.start();
    voice.lfoOsc.start();

    voice.gainNode.connect(notesBusRef.current);
    const now = audioContext.currentTime;
    voice.gainNode.gain.cancelScheduledValues(now);
    voice.gainNode.gain.setValueAtTime(0, now);
    voice.gainNode.gain.linearRampToValueAtTime(1 * volume, now + 0.05);
  };

  const stopVoice = (voice) => {
    const now = audioContext.currentTime;
    voice.gainNode.gain.cancelScheduledValues(now);
    voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
    voice.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    const stopOsc = (osc) => {
      if (!osc) return;
      try { osc.stop(now + 0.1); } catch(e){}
    };

    stopOsc(voice.amOsc);
    stopOsc(voice.fmOsc);
    stopOsc(voice.distortedFmOsc);
    stopOsc(voice.lfoOsc);
    voice.partialOscillators.forEach(stopOsc);

    setTimeout(() => {
      try { voice.gainNode.disconnect(); } catch(e){}
      voice.partialGains.forEach((g) => {
        try { g.disconnect(); } catch(e){}
      });
      try { voice.amGain.disconnect(); } catch(e){}
      try { voice.fmGain.disconnect(); } catch(e){}
      try { voice.distortedFmGain.disconnect(); } catch(e){}
      try { voice.lfoGain.disconnect(); } catch(e){}
    }, 200);
  };

  const updateVoiceParams = (voice, params) => {
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
      distortedFmIntensity,
    } = params;

    const effectiveNumPartials = (additiveMode === 'on') ? Math.min(numPartials, 50) : 1;
    const now = audioContext.currentTime;

    // Update partials
    voice.partialOscillators.forEach((osc, i) => {
      if (i < effectiveNumPartials) {
        const targetFreq = voice.baseFrequency + i * (additiveMode === 'on' ? distPartials : 0);
        osc.frequency.cancelScheduledValues(now);
        osc.frequency.linearRampToValueAtTime(targetFreq, now + 0.05);
        if (waveform === 'pulse') {
          updatePulseWave(osc, pulseWidth);
        } else {
          osc.type = waveform;
        }
        voice.partialGains[i].gain.setValueAtTime(1, now);
      } else {
        voice.partialGains[i].gain.setValueAtTime(0, now);
      }
    });

    // AM
    if (voice.amOsc && voice.amGain) {
      voice.amOsc.frequency.setValueAtTime(amFrequency, now);
      const amTarget = amMode === 'on' ? 0.5 : 0;
      voice.amGain.gain.cancelScheduledValues(now);
      voice.amGain.gain.linearRampToValueAtTime(amTarget, now + 0.05);
    }

    // FM
    if (voice.fmOsc && voice.fmGain) {
      voice.fmOsc.frequency.setValueAtTime(fmFrequency, now);
      const fmTarget = fmMode === 'on' ? 100 : 0;
      voice.fmGain.gain.cancelScheduledValues(now);
      voice.fmGain.gain.linearRampToValueAtTime(fmTarget, now + 0.05);
      // Also update the connection to partial oscillators
      voice.fmGain.disconnect();
      voice.fmGain.connect(voice.partialOscillators[0].frequency);
    }

    // Distorted FM
    if (voice.distortedFmOsc && voice.distortedFmGain) {
      voice.distortedFmOsc.frequency.setValueAtTime(fmFrequency, now);
      const distortedFmTarget = fmMode === 'on' ? (100 * distortedFmIntensity) : 0;
      voice.distortedFmGain.gain.cancelScheduledValues(now);
      voice.distortedFmGain.gain.linearRampToValueAtTime(distortedFmTarget, now + 0.05);
      // Reconnect if needed (maintains the bass effect)
      voice.distortedFmGain.disconnect();
      voice.distortedFmGain.connect(voice.partialOscillators[0].frequency);
      voice.distortedFmGain.connect(audioContext.destination);
    }

    // LFO
    if (voice.lfoOsc && voice.lfoGain) {
      voice.lfoOsc.frequency.setValueAtTime(lfoFrequency, now);
      const lfoTarget = lfoMode === 'on' ? 0.5 : 0;
      voice.lfoGain.gain.cancelScheduledValues(now);
      voice.lfoGain.gain.linearRampToValueAtTime(lfoTarget, now + 0.05);
    }
  };

  const handleVirtualKeyDown = async (key) => {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    const currentParams = parametersRef.current;
    const virtualKey = `virtual-${key.note}`;
    if (!keysDownRef.current.has(virtualKey)) {
      keysDownRef.current.add(virtualKey);
      triggerNote(virtualKey, key.frequency, currentParams);
    }
  };

  const handleVirtualKeyUp = (key) => {
    const virtualKey = `virtual-${key.note}`;
    if (keysDownRef.current.has(virtualKey)) {
      keysDownRef.current.delete(virtualKey);
      releaseNote(virtualKey);
    }
  };

  const handleOctaveDown = () => {
    setOctaveShift((prev) => Math.max(prev - 1, -1));
  };

  const handleOctaveUp = () => {
    setOctaveShift((prev) => Math.min(prev + 1, 1));
  };

  const handleSliderFocus = (sliderName) => {
    setFocusedSlider(sliderName);
  };

  const handleSliderBlur = () => {
    setFocusedSlider(null);
  };

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
      case 'lpFrequency':
        setLpFrequency(newValue);
        break;
      case 'hpFrequency':
        setHpFrequency(newValue);
        break;
      case 'bpFrequency':
        setBpFrequency(newValue);
        break;
      case 'bpQ':
        setBpQ(newValue);
        break;
      default:
        break;
    }
  };

  // Cleanup effect when the synth window is closed/unmounted
  useEffect(() => {
    return () => {
      // Stop all active voices
      activeVoicesRef.current.forEach((voice) => {
        stopVoice(voice);
      });
      activeVoicesRef.current = [];

      // Disconnect all nodes to avoid stacking multiple connections
      if (notesBusRef.current) {
        try { notesBusRef.current.disconnect(); } catch(e){}
      }
      if (lowPassRef.current) {
        try { lowPassRef.current.disconnect(); } catch(e){}
      }
      if (highPassRef.current) {
        try { highPassRef.current.disconnect(); } catch(e){}
      }
      if (bandPassRef.current) {
        try { bandPassRef.current.disconnect(); } catch(e){}
      }
      if (compressorRef.current) {
        try { compressorRef.current.disconnect(); } catch(e){}
      }
      if (masterGainRef.current) {
        try { masterGainRef.current.disconnect(); } catch(e){}
      }
    };
  }, []);

  return (
    <Modal
      closeModal={onClose}
      style={{
        width: '750px',
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
        {showKeyboard && (
          <VirtualKeyboard
            keys={shiftedKeys}
            handleVirtualKeyDown={handleVirtualKeyDown}
            handleVirtualKeyUp={handleVirtualKeyUp}
            activeOscillators={{}} 
            isTwoRows={isTwoRows}
          />
        )}

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

          <ToggleButton onClick={() => setFiltersEnabled(!filtersEnabled)}>
            {filtersEnabled ? 'Turn Filters Off' : 'Turn Filters On'}
          </ToggleButton>
        </ButtonContainer>

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
          distortedFmIntensity={distortedFmIntensity}
          setDistortedFmIntensity={setDistortedFmIntensity}
          volume={volume}
          setVolume={setVolume}
          lpFrequency={lpFrequency}
          setLpFrequency={setLpFrequency}
          hpFrequency={hpFrequency}
          setHpFrequency={setHpFrequency}
          bpFrequency={bpFrequency}
          setBpFrequency={setBpFrequency}
          bpQ={bpQ}
          setBpQ={setBpQ}
          onSliderFocus={handleSliderFocus}
          onSliderBlur={handleSliderBlur}
          onChangeSliderValue={handleChangeSliderValue}
        />

        <Instructions>
          Press keys (Z, S, X, D, C, V, G, B, H, N, J, M, Q, 2, W, 3, E, R, 5, T, 6, Y, 7, U, I) to play notes.
          <br />
          Click and hold on a slider to focus it. While focused, use Up/Down arrow keys to change its value.
        </Instructions>
      </Container>
    </Modal>
  );
};

export default Synth;