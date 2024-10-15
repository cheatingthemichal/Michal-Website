// components/VirtualKeyboard.js
import React, { useState } from 'react';
import { VirtualKeyboardContainer, OctaveContainer } from '../styles';
import WhiteKeys from './WhiteKeys';
import BlackKeys from './BlackKeys';

const VirtualKeyboard = ({
  keys,
  handleVirtualKeyDown,
  handleVirtualKeyUp,
  activeOscillators,
  isTwoRows,
}) => {
  const firstOctave = keys.filter((key) => key.note.endsWith('4'));
  const secondOctave = keys.filter(
    (key) => key.note.endsWith('5') || key.note === 'C6'
  );
  const [activeKeys, setActiveKeys] = useState(new Set());

  const handlePointerDown = (key) => {
    handleVirtualKeyDown(key);
    setActiveKeys((prev) => new Set(prev).add(key.note));
  };

  const handlePointerUp = (key) => {
    handleVirtualKeyUp(key);
    setActiveKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key.note);
      return newSet;
    });
  };

  const handlePointerEnter = (key) => {
    // Optional: Handle pointer entering a key while pressed (e.g., dragging)
    // For simplicity, this example allows multiple keys without interruption
    handleVirtualKeyDown(key);
    setActiveKeys((prev) => new Set(prev).add(key.note));
  };

  const handlePointerLeave = (key) => {
    handleVirtualKeyUp(key);
    setActiveKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key.note);
      return newSet;
    });
  };

  return (
    <VirtualKeyboardContainer
      style={{ flexDirection: isTwoRows ? 'column' : 'row' }}
    >
      <OctaveContainer>
        <WhiteKeys
          keys={firstOctave.filter((key) => key.type === 'white')}
          handleKeyDown={handlePointerDown}
          handleKeyUp={handlePointerUp}
          handleKeyEnter={handlePointerEnter}
          handleKeyLeave={handlePointerLeave}
          activeOscillators={activeOscillators}
        />
        <BlackKeys
          keys={firstOctave.filter((key) => key.type === 'black')}
          handleKeyDown={handlePointerDown}
          handleKeyUp={handlePointerUp}
          handleKeyEnter={handlePointerEnter}
          handleKeyLeave={handlePointerLeave}
          activeOscillators={activeOscillators}
        />
      </OctaveContainer>
      <OctaveContainer>
        <WhiteKeys
          keys={secondOctave.filter((key) => key.type === 'white')}
          handleKeyDown={handlePointerDown}
          handleKeyUp={handlePointerUp}
          handleKeyEnter={handlePointerEnter}
          handleKeyLeave={handlePointerLeave}
          activeOscillators={activeOscillators}
        />
        <BlackKeys
          keys={secondOctave.filter((key) => key.type === 'black')}
          handleKeyDown={handlePointerDown}
          handleKeyUp={handlePointerUp}
          handleKeyEnter={handlePointerEnter}
          handleKeyLeave={handlePointerLeave}
          activeOscillators={activeOscillators}
        />
      </OctaveContainer>
    </VirtualKeyboardContainer>
  );
};

export default VirtualKeyboard;
