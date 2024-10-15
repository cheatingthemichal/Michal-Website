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
            e.preventDefault();
            handleKeyDown(key);
            e.target.setPointerCapture(e.pointerId);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            handleKeyUp(key);
            e.target.releasePointerCapture(e.pointerId);
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
      ))}
    </WhiteKeysRow>
  );
};

export default WhiteKeys;
