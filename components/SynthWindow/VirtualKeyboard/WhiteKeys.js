import React from 'react';
import { WhiteKeysRow, WhiteKeyStyled } from '../styles';

const WhiteKeys = ({ keys, handleKeyDown, handleKeyUp, handleKeyEnter, activeOscillators }) => {
  return (
    <WhiteKeysRow>
      {keys.map((key) => (
        <WhiteKeyStyled
          key={key.note}
          onMouseDown={() => handleKeyDown(key)}
          onMouseUp={() => handleKeyUp(key)}
          onMouseEnter={() => handleKeyEnter(key)}
          active={activeOscillators[`virtual-${key.note}`] !== undefined}
        />
      ))}
    </WhiteKeysRow>
  );
};

export default WhiteKeys;
