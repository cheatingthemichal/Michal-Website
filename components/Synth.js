// components/Synth.js
import React, { useState, useEffect, useRef } from 'react';
import { List, Modal, Button } from '@react95/core';
import { Mmsys120 } from '@react95/icons';
import styled from 'styled-components';

// Styled Components for better UI management
const ControlSection = styled.div`
  margin: 10px 0;
`;

const ControlLabel = styled.p`
  margin: 5px 0;
`;

const Slider = styled.input`
  width: 100%;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Synth = ({ onClose, index, total, position }) => {
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

  // Refs for AudioContext and active oscillators
  const audioCtxRef = useRef(null);
  const activeOscillatorsRef = useRef({});
  const activeGainsRef = useRef({});

  // Frequency map (can be moved to a separate file if needed)
  const keyboardFrequencyMap = {
    '90': 261.63, // Z - C
    '83': 277.18, // S - C#
    '88': 293.66, // X - D
    '68': 311.13, // D - D#
    '67': 329.63, // C - E
    '86': 349.23, // V - F
    '71': 369.99, // G - F#
    '66': 391.99, // B - G
    '72': 415.30, // H - G#
    '78': 440.00, // N - A
    '74': 466.16, // J - A#
    '77': 493.88, // M - B
    '81': 523.25, // Q - C
    '50': 554.37, // 2 - C#
    '87': 587.33, // W - D
    '51': 622.25, // 3 - D#
    '69': 659.26, // E - E
    '82': 698.46, // R - F
    '53': 739.99, // 5 - F#
    '84': 783.99, // T - G
    '54': 830.61, // 6 - G#
    '89': 880.00, // Y - A
    '55': 932.33, // 7 - A#
    '85': 987.77, // U - B
    '73': 1046.50, // I - C
  };

  // Initialize AudioContext
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const audioCtx = audioCtxRef.current;

    // Create global gain and compressor
    const globalGain = audioCtx.createGain();
    globalGain.connect(audioCtx.destination);

    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
    compressor.connect(globalGain);

    // Event listeners for keyboard
    const handleKeyDown = (event) => {
      const key = event.keyCode.toString();
      if (keyboardFrequencyMap[key] && !activeOscillatorsRef.current[key]) {
        if (waveform === '?') {
          // Handle "crazy" mode if needed
          // Placeholder: Implement if required
        } else {
          playNote(
            key,
            keyboardFrequencyMap[key],
            additiveMode === 'on' ? numPartials : 1,
            additiveMode === 'on' ? distPartials : 0,
            amMode === 'on' ? amFrequency : 0,
            fmMode === 'on' ? fmFrequency : 0,
            lfoMode === 'on' ? lfoFrequency : 0
          );
        }
      }
    };

    const handleKeyUp = (event) => {
      const key = event.keyCode.toString();
      if (keyboardFrequencyMap[key] && activeOscillatorsRef.current[key]) {
        stopNote(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      audioCtx.close();
    };
  }, [waveform, additiveMode, numPartials, distPartials, amMode, amFrequency, fmMode, fmFrequency, lfoMode, lfoFrequency]);

  // Function to play a note
  const playNote = (key, frequency, numPartials, distPartials, amFreq, fmFreq, lfoFreq) => {
    const audioCtx = audioCtxRef.current;

    activeOscillatorsRef.current[key] = [];
    activeGainsRef.current[key] = [];

    // AM Modulation
    let amMod = null;
    if (amFreq > 0) {
      amMod = audioCtx.createOscillator();
      amMod.frequency.value = amFreq;
      const amGain = audioCtx.createGain();
      amGain.gain.value = 0.5;
      amMod.connect(amGain).connect(audioCtx.createGain());
      amMod.start();
      activeOscillatorsRef.current[key].push(amMod);
      activeGainsRef.current[key].push(amGain);
    }

    // FM Modulation
    let fmMod = null;
    if (fmFreq > 0) {
      fmMod = audioCtx.createOscillator();
      fmMod.frequency.value = fmFreq;
      const fmGain = audioCtx.createGain();
      fmGain.gain.value = 100;
      fmMod.connect(fmGain).connect(audioCtx.destination);
      fmMod.start();
      activeOscillatorsRef.current[key].push(fmMod);
      activeGainsRef.current[key].push(fmGain);
    }

    // LFO
    let lfo = null;
    if (lfoFreq > 0) {
      lfo = audioCtx.createOscillator();
      lfo.frequency.value = lfoFreq;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 0.5;
      lfo.connect(lfoGain).connect(audioCtx.destination);
      lfo.start();
      activeOscillatorsRef.current[key].push(lfo);
      activeGainsRef.current[key].push(lfoGain);
    }

    // Create oscillators for each partial
    const oscillators = [];
    for (let i = 0; i < numPartials; i++) {
      const osc = audioCtx.createOscillator();
      osc.frequency.setValueAtTime(frequency + i * distPartials, audioCtx.currentTime);
      osc.type = waveform === '?' ? 'sawtooth' : waveform; // Handle "crazy" waveform if needed
      oscillators.push(osc);
      activeOscillatorsRef.current[key].push(osc);
    }

    // Create gain node
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.1);

    // Connect oscillators to gain node
    oscillators.forEach((osc) => {
      osc.connect(gainNode);
      osc.start();
    });

    // Connect gain node to compressor
    gainNode.connect(audioCtx.destination);

    // Store gain node
    activeGainsRef.current[key].push(gainNode);
  };

  // Function to stop a note
  const stopNote = (key) => {
    const audioCtx = audioCtxRef.current;
    const gainNodes = activeGainsRef.current[key] || [];
    const oscillators = activeOscillatorsRef.current[key] || [];

    gainNodes.forEach((gainNode) => {
      gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
    });

    oscillators.forEach((osc) => {
      osc.stop(audioCtx.currentTime + 0.3);
    });

    delete activeGainsRef.current[key];
    delete activeOscillatorsRef.current[key];
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
        zIndex: 1000 + index,
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
      <ControlSection>
        <ControlLabel>Choose waveform:</ControlLabel>
        <Button
          onClick={() => setWaveform('sine')}
          active={waveform === 'sine'}
          style={{ marginRight: '5px' }}
        >
          Sine
        </Button>
        <Button
          onClick={() => setWaveform('sawtooth')}
          active={waveform === 'sawtooth'}
          style={{ marginRight: '5px' }}
        >
          Sawtooth
        </Button>
        <Button
          onClick={() => setWaveform('?')}
          active={waveform === '?'}
        >
          ?
        </Button>
      </ControlSection>

      <ControlSection>
        <ControlLabel>Additive Mode:</ControlLabel>
        <RadioGroup>
          <label>
            <input
              type="radio"
              value="off"
              checked={additiveMode === 'off'}
              onChange={() => setAdditiveMode('off')}
            />
            Off
          </label>
          <label>
            <input
              type="radio"
              value="on"
              checked={additiveMode === 'on'}
              onChange={() => setAdditiveMode('on')}
            />
            On
          </label>
        </RadioGroup>
      </ControlSection>

      {additiveMode === 'on' && (
        <>
          <ControlSection>
            <ControlLabel>Number of Partials: {numPartials}</ControlLabel>
            <Slider
              type="range"
              min="1"
              max="100"
              value={numPartials}
              onChange={(e) => setNumPartials(parseInt(e.target.value))}
            />
          </ControlSection>
          <ControlSection>
            <ControlLabel>Distance between Partials: {distPartials}</ControlLabel>
            <Slider
              type="range"
              min="0"
              max="100"
              value={distPartials}
              onChange={(e) => setDistPartials(parseInt(e.target.value))}
            />
          </ControlSection>
        </>
      )}

      <ControlSection>
        <ControlLabel>AM:</ControlLabel>
        <RadioGroup>
          <label>
            <input
              type="radio"
              value="off"
              checked={amMode === 'off'}
              onChange={() => setAmMode('off')}
            />
            Off
          </label>
          <label>
            <input
              type="radio"
              value="on"
              checked={amMode === 'on'}
              onChange={() => setAmMode('on')}
            />
            On
          </label>
        </RadioGroup>
      </ControlSection>

      {amMode === 'on' && (
        <ControlSection>
          <ControlLabel>AM Frequency: {amFrequency}</ControlLabel>
          <Slider
            type="range"
            min="0"
            max="500"
            value={amFrequency}
            onChange={(e) => setAmFrequency(parseInt(e.target.value))}
          />
        </ControlSection>
      )}

      <ControlSection>
        <ControlLabel>FM:</ControlLabel>
        <RadioGroup>
          <label>
            <input
              type="radio"
              value="off"
              checked={fmMode === 'off'}
              onChange={() => setFmMode('off')}
            />
            Off
          </label>
          <label>
            <input
              type="radio"
              value="on"
              checked={fmMode === 'on'}
              onChange={() => setFmMode('on')}
            />
            On
          </label>
        </RadioGroup>
      </ControlSection>

      {fmMode === 'on' && (
        <ControlSection>
          <ControlLabel>FM Frequency: {fmFrequency}</ControlLabel>
          <Slider
            type="range"
            min="0"
            max="500"
            value={fmFrequency}
            onChange={(e) => setFmFrequency(parseInt(e.target.value))}
          />
        </ControlSection>
      )}

      <ControlSection>
        <ControlLabel>LFO:</ControlLabel>
        <RadioGroup>
          <label>
            <input
              type="radio"
              value="off"
              checked={lfoMode === 'off'}
              onChange={() => setLfoMode('off')}
            />
            Off
          </label>
          <label>
            <input
              type="radio"
              value="on"
              checked={lfoMode === 'on'}
              onChange={() => setLfoMode('on')}
            />
            On
          </label>
        </RadioGroup>
      </ControlSection>

      {lfoMode === 'on' && (
        <ControlSection>
          <ControlLabel>LFO Frequency: {lfoFrequency}</ControlLabel>
          <Slider
            type="range"
            min="0"
            max="10"
            value={lfoFrequency}
            onChange={(e) => setLfoFrequency(parseFloat(e.target.value))}
          />
        </ControlSection>
      )}

      <ControlSection>
        <p>Press keys (Z, S, X, D, C, V, G, B, H, N, J, M, Q, 2, W, 3, E, R, 5, T, 6, Y, 7, U, I) to play notes.</p>
      </ControlSection>
    </Modal>
  );
};

export default Synth;
