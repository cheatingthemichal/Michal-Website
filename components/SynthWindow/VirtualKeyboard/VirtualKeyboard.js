// components/VirtualKeyboard.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
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

  // State for rendering active keys
  const [activeKeys, setActiveKeys] = useState(new Set());

  // Refs for tracking pointer state and active keys without causing re-renders
  const isPointerDownRef = useRef(false);
  const activeKeysRef = useRef(new Set());

  // Reference to the keyboard container
  const keyboardRef = useRef(null);

  // Global handler to reset pointer state and stop all active keys
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isPointerDownRef.current) {
        console.log('Global pointer up detected. Stopping all active keys.');
        isPointerDownRef.current = false;

        activeKeysRef.current.forEach((note) => {
          console.log(`Stopping key: ${note}`);
          handleVirtualKeyUp({ note });
        });

        setActiveKeys(new Set());
        activeKeysRef.current = new Set();
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [handleVirtualKeyUp]);

  // Event Handlers
  const handlePointerDown = useCallback(
    (key) => {
      console.log(`Pointer down on key: ${key.note}`);
      handleVirtualKeyDown(key);
      isPointerDownRef.current = true;

      const newSet = new Set(activeKeysRef.current).add(key.note);
      activeKeysRef.current = newSet;
      setActiveKeys(new Set(newSet));
    },
    [handleVirtualKeyDown]
  );

  const handlePointerUp = useCallback(
    (key) => {
      console.log(`Pointer up on key: ${key.note}`);
      handleVirtualKeyUp(key);

      const newSet = new Set(activeKeysRef.current);
      newSet.delete(key.note);
      activeKeysRef.current = newSet;
      setActiveKeys(new Set(newSet));

      // Do not reset isPointerDownRef.current here; the global handler will handle it
    },
    [handleVirtualKeyUp]
  );

  const handlePointerEnter = useCallback(
    (key) => {
      if (isPointerDownRef.current && !activeKeysRef.current.has(key.note)) {
        console.log(`Pointer entered key while pressed: ${key.note}`);
        handleVirtualKeyDown(key);

        const newSet = new Set(activeKeysRef.current).add(key.note);
        activeKeysRef.current = newSet;
        setActiveKeys(new Set(newSet));
      }
    },
    [handleVirtualKeyDown]
  );

  const handlePointerLeave = useCallback(
    (key) => {
      if (isPointerDownRef.current && activeKeysRef.current.has(key.note)) {
        console.log(`Pointer left key while pressed: ${key.note}`);
        handleVirtualKeyUp(key);

        const newSet = new Set(activeKeysRef.current);
        newSet.delete(key.note);
        activeKeysRef.current = newSet;
        setActiveKeys(new Set(newSet));
      }
    },
    [handleVirtualKeyUp]
  );

  // Comprehensive Pointer Move Handler
  const handlePointerMove = useCallback(
    (e) => {
      if (isPointerDownRef.current) {
        const x = e.clientX;
        const y = e.clientY;
        const elements = document.elementsFromPoint(x, y);
        const notesUnderPointer = elements
          .filter((el) => el.dataset && el.dataset.note)
          .map((el) => el.dataset.note);

        // Activate new keys
        notesUnderPointer.forEach((note) => {
          if (!activeKeysRef.current.has(note)) {
            const key = keys.find((k) => k.note === note);
            if (key) {
              console.log(`Pointer move activating key: ${note}`);
              handleVirtualKeyDown(key);
              activeKeysRef.current.add(note);
              setActiveKeys(new Set(activeKeysRef.current));
            }
          }
        });

        // Deactivate keys that are no longer under the pointer
        activeKeysRef.current.forEach((note) => {
          if (!notesUnderPointer.includes(note)) {
            const key = keys.find((k) => k.note === note);
            if (key) {
              console.log(`Pointer move deactivating key: ${note}`);
              handleVirtualKeyUp(key);
              activeKeysRef.current.delete(note);
              setActiveKeys(new Set(activeKeysRef.current));
            }
          }
        });
      }
    },
    [activeKeysRef, handleVirtualKeyDown, handleVirtualKeyUp, keys]
  );

  return (
    <VirtualKeyboardContainer
      ref={keyboardRef}
      onPointerMove={handlePointerMove}
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
