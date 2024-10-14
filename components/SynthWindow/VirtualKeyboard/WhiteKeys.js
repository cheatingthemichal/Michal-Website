import React from 'react';
import { WhiteKeysRow, WhiteKeyStyled } from '../styles';

const WhiteKeys = ({ keys, handleKeyDown, handleKeyUp, handleKeyEnter, handleKeyLeave, activeOscillators }) => {
  return (
    <WhiteKeysRow>
      {keys.map((key) => (
        <WhiteKeyStyled
          key={key.note}
          onMouseDown={() => handleKeyDown(key)}
          onMouseUp={() => handleKeyUp(key)}
          onMouseEnter={() => handleKeyEnter(key)}
          onMouseLeave={() => handleKeyLeave(key)}
          onTouchStart={() => handleKeyDown(key)}
          onTouchEnd={() => handleKeyUp(key)}
          onTouchMove={() => handleKeyEnter(key)}
          onTouchCancel={() => handleKeyLeave(key)}
          active={activeOscillators[`virtual-${key.note}`] !== undefined}
        />
      ))}
    </WhiteKeysRow>
  );
};

export default WhiteKeys;
