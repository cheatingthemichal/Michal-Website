import React, { useState } from 'react';
import { VirtualKeyboardContainer, OctaveContainer } from '../styles';
import WhiteKeys from './WhiteKeys';
import BlackKeys from './BlackKeys';

const VirtualKeyboard = ({ keys, handleVirtualKeyDown, handleVirtualKeyUp, activeOscillators, isTwoRows }) => {
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = (key) => {
    setIsMouseDown(true);
    handleVirtualKeyDown(key);
  };

  const handleMouseUp = (key) => {
    setIsMouseDown(false);
    handleVirtualKeyUp(key);
  };

  return (
    <VirtualKeyboardContainer style={{ flexDirection: isTwoRows ? 'column' : 'row' }}>
      <OctaveContainer>
        <WhiteKeys
          keys={keys.filter((key) => key.note.endsWith('4') && key.type === 'white')}
          handleKeyDown={handleMouseDown}
          handleKeyUp={handleMouseUp}
          handleKeyEnter={(key) => isMouseDown && handleVirtualKeyDown(key)}
          activeOscillators={activeOscillators}
        />
        <BlackKeys
          keys={keys.filter((key) => key.note.endsWith('4') && key.type === 'black')}
          handleKeyDown={handleMouseDown}
          handleKeyUp={handleMouseUp}
          handleKeyEnter={(key) => isMouseDown && handleVirtualKeyDown(key)}
          activeOscillators={activeOscillators}
        />
      </OctaveContainer>
      <OctaveContainer>
        <WhiteKeys
          keys={keys.filter((key) => key.note.endsWith('5') && key.type === 'white')}
          handleKeyDown={handleMouseDown}
          handleKeyUp={handleMouseUp}
          handleKeyEnter={(key) => isMouseDown && handleVirtualKeyDown(key)}
          activeOscillators={activeOscillators}
        />
        <BlackKeys
          keys={keys.filter((key) => key.note.endsWith('5') && key.type === 'black')}
          handleKeyDown={handleMouseDown}
          handleKeyUp={handleMouseUp}
          handleKeyEnter={(key) => isMouseDown && handleVirtualKeyDown(key)}
          activeOscillators={activeOscillators}
        />
      </OctaveContainer>
    </VirtualKeyboardContainer>
  );
};

export default VirtualKeyboard;
