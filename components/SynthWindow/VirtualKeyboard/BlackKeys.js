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

const BlackKeys = ({
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
            onPointerDown={(e) => {
              e.preventDefault(); // Prevents default actions like text selection
              handleKeyDown(key);
              e.target.setPointerCapture(e.pointerId); // Capture pointer to continue receiving events
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleKeyUp(key);
              e.target.releasePointerCapture(e.pointerId); // Release pointer capture
            }}
            onPointerEnter={(e) => {
              e.preventDefault();
              handleKeyEnter(key);
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              handleKeyLeave(key);
            }}
            active={activeOscillators[`virtual-${key.note}`] !== undefined}
          />
        );
      })}
    </>
  );
};

export default BlackKeys;
