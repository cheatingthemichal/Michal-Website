// components/VirtualKeyboard/BlackKeys.js
import React from 'react';
import { BlackKeyStyled } from '../styles';

// Define the left offsets for each black key within a single octave
const blackKeyOffsets = {
  'C#': 33,
  'D#': 77,
  'F#': 165,
  'G#': 209,
  'A#': 253,
};

const blackKeyOffsetsSmall = {
  'C#': 25,
  'D#': 60,
  'F#': 125,
  'G#': 160,
  'A#': 195,
};

const BlackKeys = ({ keys, handleKeyDown, handleKeyUp, activeOscillators }) => {
  const isSmallScreen = window.innerWidth <= 600;
  const offsets = isSmallScreen ? blackKeyOffsetsSmall : blackKeyOffsets;

  return (
    <>
      {keys.map((key) => {
        const noteName = key.note.slice(0, -1);
        const baseOffset = offsets[noteName] || 0;
        const leftOffset = baseOffset;

        return (
          <BlackKeyStyled
            key={key.note}
            style={{ left: `${leftOffset}px` }}
            onMouseDown={() => handleKeyDown(key)}
            onMouseUp={() => handleKeyUp(key)}
            onMouseLeave={() => handleKeyUp(key)}
            active={activeOscillators[`virtual-${key.note}`] !== undefined}
          />
        );
      })}
    </>
  );
};


export default BlackKeys;
