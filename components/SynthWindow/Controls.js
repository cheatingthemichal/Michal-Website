// components/Controls.js
import React from 'react';
import { Button, RadioButton, Range } from '@react95/core';
import {
  Container,
  ControlRow,
  Label,
  RangeContainer,
  RadioGroup,
  ButtonGroup,
} from './styles';

const Controls = ({
  waveform,
  setWaveform,
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
  crazy,
  setCrazy,
}) => {
  return (
    <Container>
      {/* Waveform Selection */}
      <ControlRow>
        <Label>Waveform:</Label>
        <ButtonGroup>
          <Button
            onClick={() => {
              setWaveform('sine');
              setCrazy(false);
            }}
            active={waveform === 'sine'}
            style={{ marginRight: '5px' }}
          >
            Sine
          </Button>
          <Button
            onClick={() => {
              setWaveform('sawtooth');
              setCrazy(false);
            }}
            active={waveform === 'sawtooth'}
            style={{ marginRight: '5px' }}
          >
            Sawtooth
          </Button>
          <Button
            onClick={() => {
              setCrazy(!crazy);
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
    </Container>
  );
};

export default Controls;