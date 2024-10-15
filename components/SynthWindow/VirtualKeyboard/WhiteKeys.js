// components/WhiteKeys.js
import React from 'react';
import { WhiteKeysRow, WhiteKeyStyled } from '../styles';

const WhiteKeys = ({
  keys,
  handleKeyDown,
  handleKeyUp,
  handleKeyEnter,
  handleKeyLeave,
  activeOscillators,
}) => {
  return (
    <WhiteKeysRow>
      {keys.map((key) => (
        <WhiteKeyStyled
          key={key.note}
          onPointerDown={(e) => {
            e.preventDefault(); // Prevents default actions like text selection
            handleKeyDown(key);
            // Removed pointer capture
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            handleKeyUp(key);
            // Removed pointer release
          }}
          onPointerEnter={(e) => {
            handleKeyEnter(key);
          }}
          onPointerLeave={(e) => {
            handleKeyLeave(key);
          }}
          active={activeOscillators[`virtual-${key.note}`] !== undefined}
          role="button"
          aria-label={`White key ${key.note}`}
          tabIndex="0"
        />
      ))}
    </WhiteKeysRow>
  );
};

export default WhiteKeys;
