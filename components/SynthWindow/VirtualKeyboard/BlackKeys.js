// components/VirtualKeyboard/BlackKeys.js
import React from 'react';
import { BlackKeyStyled } from '../styles';

const BlackKeys = ({ keys, handleKeyDown, handleKeyUp, activeOscillators }) => {
  return (
    <>
      {keys.map((key, index) => {
        // Determine the position of the black key relative to white keys
        // Adjust the left position based on the white key index
        // Assuming each white key is 42px wide (40px + 2px margin on each side)
        const whiteKeyIndex = Math.floor(index / 2); // Simple approximation
        const leftOffset = whiteKeyIndex * 42 + 30; // Adjust as needed for alignment

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
