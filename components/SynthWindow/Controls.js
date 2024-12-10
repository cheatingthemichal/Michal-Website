import React from 'react';
import { RadioButton, Range } from '@react95/core';
import {
  Container,
  ControlRow,
  Label,
  RangeContainer,
  RadioGroup,
  ButtonGroup,
  StyledButton
} from './styles';

const Controls = ({
  waveform,
  setWaveform,
  pulseWidth,
  setPulseWidth,
  additiveMode,
  setAdditiveMode,
  numPartials,
  setNumPartials,
  distPartials,
  setDistPartials,
  amMode,
  setAmMode,
  amFrequency,
  setAmFrequency,
  fmMode,
  setFmMode,
  fmFrequency,
  setFmFrequency,
  lfoMode,
  setLfoMode,
  lfoFrequency,
  setLfoFrequency,
  distortedFmIntensity,
  setDistortedFmIntensity,
  volume,
  setVolume,
  // New filter props
  lpFrequency,
  setLpFrequency,
  hpFrequency,
  setHpFrequency,
  bpFrequency,
  setBpFrequency,
  bpQ,
  setBpQ,
  // Focus/blur handlers for sliders if you need them
  onSliderFocus,
  onSliderBlur,
  onChangeSliderValue
}) => {
  return (
    <Container>
      {/* Waveform Selection */}
      <ControlRow>
        <Label>Waveform:</Label>
        <ButtonGroup>
          <StyledButton
            onClick={() => {
              setWaveform('sine');
            }}
            active={waveform === 'sine'}
          >
            Sine
          </StyledButton>
          <StyledButton
            onClick={() => {
              setWaveform('sawtooth');
            }}
            active={waveform === 'sawtooth'}
          >
            Saw
          </StyledButton>
          <StyledButton
            onClick={() => {
              setWaveform('square');
            }}
            active={waveform === 'square'}
          >
            Square
          </StyledButton>
          <StyledButton
            onClick={() => {
              setWaveform('triangle');
            }}
            active={waveform === 'triangle'}
          >
            Triangle
          </StyledButton>
          <StyledButton
            onClick={() => {
              setWaveform('pulse');
            }}
            active={waveform === 'pulse'}
          >
            Pulse
          </StyledButton>
        </ButtonGroup>
      </ControlRow>

      {/* Pulse Width (Pulse Waveform Only) */}
      {waveform === 'pulse' && (
        <ControlRow>
          <Label>Pulse Width: {pulseWidth.toFixed(2)}</Label>
          <RangeContainer>
            <Range
              id="pulseWidth"
              min={0.1}
              max={0.9}
              step={0.01}
              value={pulseWidth}
              onFocus={() => onSliderFocus && onSliderFocus('pulseWidth')}
              onBlur={() => onSliderBlur && onSliderBlur()}
              onChange={(e) => setPulseWidth(parseFloat(e.target.value))}
            />
          </RangeContainer>
        </ControlRow>
      )}

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
                onFocus={() => onSliderFocus && onSliderFocus('numPartials')}
                onBlur={() => onSliderBlur && onSliderBlur()}
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
                onFocus={() => onSliderFocus && onSliderFocus('distPartials')}
                onBlur={() => onSliderBlur && onSliderBlur()}
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

      {amMode === 'on' && (
        <ControlRow>
          <Label>AM Frequency: {amFrequency}</Label>
          <RangeContainer>
            <Range
              id="amFrequency"
              min={0}
              max={500}
              value={amFrequency}
              onFocus={() => onSliderFocus && onSliderFocus('amFrequency')}
              onBlur={() => onSliderBlur && onSliderBlur()}
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

      {fmMode === 'on' && (
        <>
          <ControlRow>
            <Label>FM Frequency: {fmFrequency}</Label>
            <RangeContainer>
              <Range
                id="fmFrequency"
                min={0}
                max={500}
                value={fmFrequency}
                onFocus={() => onSliderFocus && onSliderFocus('fmFrequency')}
                onBlur={() => onSliderBlur && onSliderBlur()}
                onChange={(e) => setFmFrequency(parseInt(e.target.value))}
              />
            </RangeContainer>
          </ControlRow>

          <ControlRow>
            <Label>Bass Distortion Intensity: {distortedFmIntensity}</Label>
            <RangeContainer>
              <Range
                id="distortedFmIntensity"
                min={0}
                max={1}
                step={0.01}
                value={distortedFmIntensity}
                onFocus={() => onSliderFocus && onSliderFocus('distortedFmIntensity')}
                onBlur={() => onSliderBlur && onSliderBlur()}
                onChange={(e) => setDistortedFmIntensity(parseFloat(e.target.value))}
              />
            </RangeContainer>
          </ControlRow>
        </>
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
              onFocus={() => onSliderFocus && onSliderFocus('lfoFrequency')}
              onBlur={() => onSliderBlur && onSliderBlur()}
              onChange={(e) => setLfoFrequency(parseFloat(e.target.value))}
            />
          </RangeContainer>
        </ControlRow>
      )}

      {/* Volume Control */}
      <ControlRow>
        <Label>Volume: {(volume * 100).toFixed(0)}%</Label>
        <RangeContainer>
          <Range
            id="volume"
            min={0}
            max={4}
            step={0.01}
            value={volume}
            onFocus={() => onSliderFocus && onSliderFocus('volume')}
            onBlur={() => onSliderBlur && onSliderBlur()}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
        </RangeContainer>
      </ControlRow>

      {/* Filter Controls */}
      <ControlRow>
        <Label>Low-Pass Cutoff: {lpFrequency} Hz</Label>
        <RangeContainer>
          <Range
            id="lpFrequency"
            min={20}
            max={20000}
            step={10}
            value={lpFrequency}
            onFocus={() => onSliderFocus && onSliderFocus('lpFrequency')}
            onBlur={() => onSliderBlur && onSliderBlur()}
            onChange={(e) => setLpFrequency(parseInt(e.target.value))}
          />
        </RangeContainer>
      </ControlRow>

      <ControlRow>
        <Label>High-Pass Cutoff: {hpFrequency} Hz</Label>
        <RangeContainer>
          <Range
            id="hpFrequency"
            min={20}
            max={20000}
            step={10}
            value={hpFrequency}
            onFocus={() => onSliderFocus && onSliderFocus('hpFrequency')}
            onBlur={() => onSliderBlur && onSliderBlur()}
            onChange={(e) => setHpFrequency(parseInt(e.target.value))}
          />
        </RangeContainer>
      </ControlRow>

      <ControlRow>
        <Label>Band-Pass Frequency: {bpFrequency} Hz</Label>
        <RangeContainer>
          <Range
            id="bpFrequency"
            min={20}
            max={20000}
            step={10}
            value={bpFrequency}
            onFocus={() => onSliderFocus && onSliderFocus('bpFrequency')}
            onBlur={() => onSliderBlur && onSliderBlur()}
            onChange={(e) => setBpFrequency(parseInt(e.target.value))}
          />
        </RangeContainer>
      </ControlRow>

      <ControlRow>
        <Label>Band-Pass Q: {bpQ.toFixed(2)}</Label>
        <RangeContainer>
          <Range
            id="bpQ"
            min={0.1}
            max={20}
            step={0.1}
            value={bpQ}
            onFocus={() => onSliderFocus && onSliderFocus('bpQ')}
            onBlur={() => onSliderBlur && onSliderBlur()}
            onChange={(e) => setBpQ(parseFloat(e.target.value))}
          />
        </RangeContainer>
      </ControlRow>
    </Container>
  );
};

export default Controls;
