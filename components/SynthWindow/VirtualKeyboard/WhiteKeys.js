// components/WhiteKeys.js
import React from 'react';
import { WhiteKeysRow, WhiteKeyStyled } from '../styles';

const WhiteKeys = React.memo(({
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
          aria-label={`White key ${key.note}`}
          tabIndex="0"
        />
      ))}
    </WhiteKeysRow>
  );
});

export default WhiteKeys;