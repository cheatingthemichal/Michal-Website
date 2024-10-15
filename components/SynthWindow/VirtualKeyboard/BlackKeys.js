// components/BlackKeys.js
import React from 'react';
import { BlackKeyStyled } from '../styles';

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

const BlackKeys = React.memo(({
  keys,
  handleKeyDown,
  handleKeyUp,
  handleKeyEnter,
  handleKeyLeave,
  activeOscillators,
}) => {
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
            data-note={key.note} // Assign unique identifier
            onPointerDown={(e) => {
              e.preventDefault(); // Prevents default actions like text selection
              handleKeyDown(key);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleKeyUp(key);
            }}
            onPointerEnter={(e) => {
              handleKeyEnter(key);
            }}
            onPointerLeave={(e) => {
              handleKeyLeave(key);
            }}
            active={activeOscillators[`virtual-${key.note}`] !== undefined}
            role="button"
            aria-label={`Black key ${key.note}`}
            tabIndex="0"
          />
        );
      })}
    </>
  );
});

export default BlackKeys;