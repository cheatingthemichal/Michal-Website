// components/VirtualKeyboard/VirtualKeyboard.js
import React from 'react';
import { VirtualKeyboardContainer, OctaveContainer } from '../styles';
import WhiteKeys from './WhiteKeys';
import BlackKeys from './BlackKeys';

const VirtualKeyboard = ({
  keys,
  handleVirtualKeyDown,
  handleVirtualKeyUp,
  activeOscillators,
}) => {
  // Split keys into two octaves based on their octave number
  const firstOctave = keys.filter((key) => key.note.endsWith('4') || key.note === 'C5');
  const secondOctave = keys.filter((key) => key.note.endsWith('5') || key.note === 'C6');

  return (
    <VirtualKeyboardContainer>
      {/* First Octave */}
      <OctaveContainer>
        <WhiteKeys
          keys={firstOctave.filter((key) => key.type === 'white')}
          handleKeyDown={handleVirtualKeyDown}
          handleKeyUp={handleVirtualKeyUp}
          activeOscillators={activeOscillators}
        />
        <BlackKeys
          keys={firstOctave.filter((key) => key.type === 'black')}
          handleKeyDown={handleVirtualKeyDown}
          handleKeyUp={handleVirtualKeyUp}
          activeOscillators={activeOscillators}
        />
      </OctaveContainer>

      {/* Second Octave */}
      <OctaveContainer>
        <WhiteKeys
          keys={secondOctave.filter((key) => key.type === 'white')}
          handleKeyDown={handleVirtualKeyDown}
          handleKeyUp={handleVirtualKeyUp}
          activeOscillators={activeOscillators}
        />
        <BlackKeys
          keys={secondOctave.filter((key) => key.type === 'black')}
          handleKeyDown={handleVirtualKeyDown}
          handleKeyUp={handleVirtualKeyUp}
          activeOscillators={activeOscillators}
        />
      </OctaveContainer>
    </VirtualKeyboardContainer>
  );
};

export default VirtualKeyboard;
