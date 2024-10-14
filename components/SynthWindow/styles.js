// components/styles.js
import styled from 'styled-components';

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
  gap: 10px;
`;

export const VirtualKeyboardContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  margin-top: 20px;
  user-select: none;
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
  margin: 0 2px;
`;

export const BlackKeyStyled = styled.div`
  width: 25px;
  height: 120px;
  background: black;
  border: 1px solid #333;
  border-radius: 4px;
  position: absolute;
  top: 0;
  z-index: 2;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: ${({ active }) => (active ? 'inset 0px 0px 5px #fff' : 'none')};
`;

export const Instructions = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: #555;
`;