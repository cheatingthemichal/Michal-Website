import React from 'react';
import { BlackKeyStyled } from '../styles';

const BlackKeys = ({ keys, handleKeyDown, handleKeyUp, handleKeyEnter, activeOscillators }) => {
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
            onMouseEnter={() => handleKeyEnter(key)}
            active={activeOscillators[`virtual-${key.note}`] !== undefined}
          />
        );
      })}
    </>
  );
};

export default BlackKeys;
