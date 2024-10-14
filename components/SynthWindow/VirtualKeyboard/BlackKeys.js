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

const BlackKeys = ({ keys, handleKeyDown, handleKeyUp, activeOscillators}) => {
  return (
    <>
      {keys.map((key) => {
        // Extract the note name without the octave number (e.g., 'C#4' -> 'C#')
        const noteName = key.note.slice(0, -1);

        // Get the base left offset for the note within the octave
        const baseOffset = blackKeyOffsets[noteName] || 0;

        // Total left offset is base offset (no octave shift)
        const leftOffset = baseOffset;

        return (
          <BlackKeyStyled
            key={key.note}
            style={{ left: `${leftOffset}px`}}
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
