// components/styles.js
import styled from 'styled-components';
import { Button } from '@react95/core';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  font-size: 12px;
`;

export const ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Label = styled.label`
  flex: 1;
  margin-right: 10px;
`;

export const RangeContainer = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 10px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  max-width: 100%;

  @media (max-width: 600px) {
    max-width: 200px;
  }
`;

export const StyledButton = styled(Button)`
  flex: 1 0 calc(16.666% - 5px);
  min-width: 60px;

  @media (max-width: 600px) {
    flex: 1 0 calc(50% - 5px);
  }
`;

export const VirtualKeyboardContainer = styled.div`
  width: 100%;
  max-width: 770px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  position: relative;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 24px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 12px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }
`;

export const WhiteKeysRow = styled.div`
  display: flex;
  margin-bottom: 5px;
`;

export const WhiteKeyStyled = styled.div`
  width: 40px;
  height: 200px;
  background: white;
  border: 1px solid black;
  border-radius: 4px;
  position: relative;
  box-shadow: ${({ active }) => (active ? 'inset 0px 0px 5px #000' : 'none')};
  cursor: pointer;
  touch-action: none;
  margin: 0 2px;

  @media (max-width: 600px) {
    width: 30px;
  }
`;

export const BlackKeyStyled = styled.div`
  width: 25px;
  height: 120px;
  background: black;
  border: 1px solid #333;
  border-radius: 4px;
  position: absolute;
  z-index: 2;
  touch-action: none;
  cursor: pointer;
  box-shadow: ${({ active }) => (active ? 'inset 0px 0px 5px #fff' : 'none')};
  
  @media (max-width: 600px) {
    width: 20px;
  }
`;

export const OctaveContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

export const Instructions = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: #555;
`;