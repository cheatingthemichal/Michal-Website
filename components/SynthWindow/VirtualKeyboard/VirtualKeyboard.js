import React, { useState } from 'react';
import { VirtualKeyboardContainer, OctaveContainer } from '../styles';
import WhiteKeys from './WhiteKeys';
import BlackKeys from './BlackKeys';

const VirtualKeyboard = ({ keys, handleVirtualKeyDown, handleVirtualKeyUp, activeOscillators, isTwoRows }) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const firstOctave = keys.filter((key) => key.note.endsWith('4'));
  const secondOctave = keys.filter((key) => key.note.endsWith('5') || key.note === 'C6');

  const handleMouseDown = (key) => {
    setIsMouseDown(true);
    handleVirtualKeyDown(key);
    setActiveKey(key);  // Track the current active key
  };

  const handleMouseUp = (key) => {
    setIsMouseDown(false);
    handleVirtualKeyUp(key);
    setActiveKey(null);  // Clear the active key when mouse is released
  };

  const handleMouseEnter = (key) => {
    if (isMouseDown) {
      if (activeKey && activeKey.note !== key.note) {
        handleVirtualKeyUp(activeKey);  // Stop the previous key
      }
      handleVirtualKeyDown(key);  // Start the new key
      setActiveKey(key);  // Update the active key
    }
  };

  const handleMouseLeave = (key) => {
    if (isMouseDown && activeKey && activeKey.note === key.note) {
      handleVirtualKeyUp(key);  // Stop the key when the mouse leaves
      setActiveKey(null);  // Clear the active key on leave
    }
  };

  return (
    <VirtualKeyboardContainer style={{ flexDirection: isTwoRows ? 'column' : 'row' }}>
      <OctaveContainer>
        <WhiteKeys
          keys={firstOctave.filter((key) => key.type === 'white')}
          handleKeyDown={handleMouseDown}
          handleKeyUp={handleMouseUp}
          handleKeyEnter={handleMouseEnter}
          handleKeyLeave={handleMouseLeave}
          activeOscillators={activeOscillators}
        />
        <BlackKeys
          keys={firstOctave.filter((key) => key.type === 'black')}
          handleKeyDown={handleMouseDown}
          handleKeyUp={handleMouseUp}
          handleKeyEnter={handleMouseEnter}
          handleKeyLeave={handleMouseLeave}
          activeOscillators={activeOscillators}
        />
      </OctaveContainer>
      <OctaveContainer>
        <WhiteKeys
          keys={secondOctave.filter((key) => key.type === 'white')}
          handleKeyDown={handleMouseDown}
          handleKeyUp={handleMouseUp}
          handleKeyEnter={handleMouseEnter}
          handleKeyLeave={handleMouseLeave}
          activeOscillators={activeOscillators}
        />
        <BlackKeys
          keys={secondOctave.filter((key) => key.type === 'black')}
          handleKeyDown={handleMouseDown}
          handleKeyUp={handleMouseUp}
          handleKeyEnter={handleMouseEnter}
          handleKeyLeave={handleMouseLeave}
          activeOscillators={activeOscillators}
        />
      </OctaveContainer>
    </VirtualKeyboardContainer>
  );
};

export default VirtualKeyboard;
