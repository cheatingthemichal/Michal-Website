// components/VirtualKeyboard.js
import React, { useState, useRef, useEffect } from 'react';
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
  const isPointerDownRef = useRef(false);

  // Global handler to reset pointer state and stop all active keys
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isPointerDownRef.current) {
        isPointerDownRef.current = false;
        // Stop all active keys
        activeKeys.forEach((note) => {
          handleVirtualKeyUp({ note });
        });
        setActiveKeys(new Set());
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [activeKeys, handleVirtualKeyUp]);

  const handlePointerDown = (key) => {
    handleVirtualKeyDown(key);
    setActiveKeys((prev) => new Set(prev).add(key.note));
    isPointerDownRef.current = true;
  };

  const handlePointerUp = (key) => {
    handleVirtualKeyUp(key);
    setActiveKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key.note);
      return newSet;
    });
    // Do not set isPointerDownRef.current here; global handler will handle it
  };

  const handlePointerEnter = (key) => {
    if (isPointerDownRef.current) {
      if (!activeKeys.has(key.note)) {
        handleVirtualKeyDown(key);
        setActiveKeys((prev) => new Set(prev).add(key.note));
      }
    }
  };

  const handlePointerLeave = (key) => {
    if (isPointerDownRef.current) {
      if (activeKeys.has(key.note)) {
        handleVirtualKeyUp(key);
        setActiveKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key.note);
          return newSet;
        });
      }
    }
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
