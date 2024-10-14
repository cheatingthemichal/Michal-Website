import React from 'react';
import { WhiteKeysRow, WhiteKeyStyled } from '../styles';

const WhiteKeys = ({ keys, handleKeyDown, handleKeyUp, activeOscillators }) => {
  return (
    <WhiteKeysRow>
      {keys.map((key) => (
        <WhiteKeyStyled
          key={key.note}
          onMouseDown={() => handleKeyDown(key)}
          onMouseUp={() => handleKeyUp(key)}
          onMouseLeave={() => handleKeyUp(key)}
          onTouchStart={() => handleKeyDown(key)}
          onTouchEnd={() => handleKeyUp(key)}
          active={activeOscillators[`virtual-${key.note}`] !== undefined}
        />
      ))}
    </WhiteKeysRow>
  );
};

export default WhiteKeys;
