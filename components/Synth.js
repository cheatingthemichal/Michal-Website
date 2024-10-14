// components/Synth.js
import React, { useState, useEffect, useRef } from 'react';
import { List, Modal, Button, RadioButton, Range } from '@react95/core';
import { Mmsys120 } from '@react95/icons';
import styled from 'styled-components';

// Styled Components for better UI management
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px; /* Adjusted padding for conciseness */
  font-size: 12px;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.label`
  flex: 1;
  margin-right: 10px;
`;

const RangeContainer = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ButtonGroup = styled.div`
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
  const [crazy, setCrazy] = useState(false); // New state for crazy mode

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
    '72': 415.3,  // H - G#
    '78': 440,     // N - A
    '74': 466.16,  // J - A#
    '77': 493.88,  // M - B
    '81': 523.25,  // Q - C
    '50': 554.37,  // 2 - C#
    '87': 587.33,  // W - D
    '51': 622.25,  // 3 - D#
    '69': 659.26,  // E - E
    '82': 698.46,  // R - F
    '53': 739.99,  // 5 - F#
    '84': 783.99,  // T - G
    '54': 830.61,  // 6 - G#
    '89': 880,     // Y - A
    '55': 932.33,  // 7 - A#
    '85': 987.77,  // U - B
    '73': 1046.5,  // I - C
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
        if (crazy) {
          playCrazy();
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
  }, [waveform, additiveMode, numPartials, distPartials, amMode, amFrequency, fmMode, fmFrequency, lfoMode, lfoFrequency, crazy]); // Added 'crazy' to dependencies

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
      osc.type = waveform; // Use the current waveform state
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

  // Function to shuffle an array
  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  };

  // Function to play a crazy note
  const playCrazy = () => {
    const audioCtx = audioCtxRef.current;
    const keys = Object.keys(keyboardFrequencyMap);
    const shuffledKeys = shuffleArray([...keys]);
    const selectedKey = shuffledKeys[0]; // Pick the first key after shuffle

    if (selectedKey && !activeOscillatorsRef.current[selectedKey]) {
      // Play the selected key with current settings
      playNote(
        selectedKey,
        keyboardFrequencyMap[selectedKey],
        additiveMode === 'on' ? numPartials : 1,
        additiveMode === 'on' ? distPartials : 0,
        amMode === 'on' ? amFrequency : 0,
        fmMode === 'on' ? fmFrequency : 0,
        lfoMode === 'on' ? lfoFrequency : 0
      );

      // Schedule stopping the note after a short duration
      setTimeout(() => {
        stopNote(selectedKey);
      }, 300); // 300ms duration
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
      <Container>
        {/* Waveform Selection */}
        <ControlRow>
          <Label>Waveform:</Label>
          <ButtonGroup>
            <Button
              onClick={() => {
                setWaveform('sine');
                setCrazy(false); // Turn off crazy mode if active
              }}
              active={waveform === 'sine'}
              style={{ marginRight: '5px' }}
            >
              Sine
            </Button>
            <Button
              onClick={() => {
                setWaveform('sawtooth');
                setCrazy(false); // Turn off crazy mode if active
              }}
              active={waveform === 'sawtooth'}
              style={{ marginRight: '5px' }}
            >
              Sawtooth
            </Button>
            <Button
              onClick={() => {
                setCrazy(!crazy);
                // setWaveform('?'); // Removed this line
              }}
              active={crazy}
            >
              ?
            </Button>
          </ButtonGroup>
        </ControlRow>

        {/* Additive Mode */}
        <ControlRow>
          <Label>Additive Mode:</Label>
          <RadioGroup>
            <RadioButton
              id="additive-off"
              name="additiveMode"
              value="off"
              checked={additiveMode === 'off'}
              onChange={() => setAdditiveMode('off')}
            />
            <Label htmlFor="additive-off">Off</Label>
            <RadioButton
              id="additive-on"
              name="additiveMode"
              value="on"
              checked={additiveMode === 'on'}
              onChange={() => setAdditiveMode('on')}
            />
            <Label htmlFor="additive-on">On</Label>
          </RadioGroup>
        </ControlRow>

        {/* Additive Controls */}
        {additiveMode === 'on' && (
          <>
            <ControlRow>
              <Label>Number of Partials: {numPartials}</Label>
              <RangeContainer>
                <Range
                  id="numPartials"
                  min={1}
                  max={100}
                  value={numPartials}
                  onChange={(e) => setNumPartials(parseInt(e.target.value))}
                />
              </RangeContainer>
            </ControlRow>
            <ControlRow>
              <Label>Distance Between Partials: {distPartials}</Label>
              <RangeContainer>
                <Range
                  id="distPartials"
                  min={0}
                  max={100}
                  value={distPartials}
                  onChange={(e) => setDistPartials(parseInt(e.target.value))}
                />
              </RangeContainer>
            </ControlRow>
          </>
        )}

        {/* AM Modulation */}
        <ControlRow>
          <Label>AM:</Label>
          <RadioGroup>
            <RadioButton
              id="am-off"
              name="amMode"
              value="off"
              checked={amMode === 'off'}
              onChange={() => setAmMode('off')}
            />
            <Label htmlFor="am-off">Off</Label>
            <RadioButton
              id="am-on"
              name="amMode"
              value="on"
              checked={amMode === 'on'}
              onChange={() => setAmMode('on')}
            />
            <Label htmlFor="am-on">On</Label>
          </RadioGroup>
        </ControlRow>

        {/* AM Frequency Control */}
        {amMode === 'on' && (
          <ControlRow>
            <Label>AM Frequency: {amFrequency}</Label>
            <RangeContainer>
              <Range
                id="amFrequency"
                min={0}
                max={500}
                value={amFrequency}
                onChange={(e) => setAmFrequency(parseInt(e.target.value))}
              />
            </RangeContainer>
          </ControlRow>
        )}

        {/* FM Modulation */}
        <ControlRow>
          <Label>FM:</Label>
          <RadioGroup>
            <RadioButton
              id="fm-off"
              name="fmMode"
              value="off"
              checked={fmMode === 'off'}
              onChange={() => setFmMode('off')}
            />
            <Label htmlFor="fm-off">Off</Label>
            <RadioButton
              id="fm-on"
              name="fmMode"
              value="on"
              checked={fmMode === 'on'}
              onChange={() => setFmMode('on')}
            />
            <Label htmlFor="fm-on">On</Label>
          </RadioGroup>
        </ControlRow>

        {/* FM Frequency Control */}
        {fmMode === 'on' && (
          <ControlRow>
            <Label>FM Frequency: {fmFrequency}</Label>
            <RangeContainer>
              <Range
                id="fmFrequency"
                min={0}
                max={500}
                value={fmFrequency}
                onChange={(e) => setFmFrequency(parseInt(e.target.value))}
              />
            </RangeContainer>
          </ControlRow>
        )}

        {/* LFO Modulation */}
        <ControlRow>
          <Label>LFO:</Label>
          <RadioGroup>
            <RadioButton
              id="lfo-off"
              name="lfoMode"
              value="off"
              checked={lfoMode === 'off'}
              onChange={() => setLfoMode('off')}
            />
            <Label htmlFor="lfo-off">Off</Label>
            <RadioButton
              id="lfo-on"
              name="lfoMode"
              value="on"
              checked={lfoMode === 'on'}
              onChange={() => setLfoMode('on')}
            />
            <Label htmlFor="lfo-on">On</Label>
          </RadioGroup>
        </ControlRow>

        {/* LFO Frequency Control */}
        {lfoMode === 'on' && (
          <ControlRow>
            <Label>LFO Frequency: {lfoFrequency}</Label>
            <RangeContainer>
              <Range
                id="lfoFrequency"
                min={0}
                max={10}
                step={0.1}
                value={lfoFrequency}
                onChange={(e) => setLfoFrequency(parseFloat(e.target.value))}
              />
            </RangeContainer>
          </ControlRow>
        )}

        {/* Instructions */}
        <ControlRow>
          <Label style={{ flex: 1 }}>
            Press keys (Z, S, X, D, C, V, G, B, H, N, J, M, Q, 2, W, 3, E, R, 5, T, 6, Y, 7, U, I) to play notes.
          </Label>
        </ControlRow>
      </Container>
    </Modal>
  );
};

export default Synth;
