import React, { useRef, useEffect, useCallback, useState } from 'react';
import { RadioButton, Button, Range } from '@react95/core';
import { Mspaint, Time } from '@react95/icons';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px; /* Reduced padding */
  font-size: 12px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: -5px; /* Adjusted to remove top whitespace */
`;

const ButtonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
`;

const NowPlayingAndSeekRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-grow: 1;
`;

const ControlColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.label`
  cursor: pointer;
  margin: 0;
`;

const InlineControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px; 
  width: 100%;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ButtonLabel = styled.span`
  display: block;
  text-align: center;
  white-space: pre-line;
`;

const CustomButton = styled(Button)`
  text-align: center;
  display: inline-block;
  margin: 1;
  width: 90px;
  height: 40px;
  padding: 0; 
  line-height: normal;
  white-space: pre-line;
`;

const PlayPauseButton = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 8px;
`;

const PlayIcon = styled.div`
  width: 0;
  height: 0;
  border-left: 12px solid black;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
`;

const PauseIcon = styled.div`
  width: 12px;
  height: 12px;
  background-color: black;
`;

const ControlElements = ({
  fileName,
  onFileChange,
  handleOpenAlert,
  handleMemoryChange,
  handleVersionChange,
  handleTauChange,
  handleNormChange,
  handleFFTSizeChange,
  handlePlay,
  handlePause,
  handleSeek,
  handleSpeedChange,
  handleColorChange,
  currentTime,
  duration,
  isPlaying,
  setIsPlaying
}) => {
  const fileInputRef = useRef(null);
  const [seekValue, setSeekValue] = useState(0);
  const [speedValue, setSpeedValue] = useState(1);

  const handleChooseFileClick = () => {
    fileInputRef.current.click();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeekChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    setSeekValue(value);
    handleSeek(value);
  }, [handleSeek]);

  const handleSpeedSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    setSpeedValue(value);
    handleSpeedChange(value);
  };

  useEffect(() => {
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (duration) {
      setSeekValue((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);

  useEffect(() => {
    setSpeedValue(1); // Reset speed value to 1 when a new song is loaded or selected
  }, [fileName]);

  return (
    <Container>
      <TopRow>
        <ButtonColumn>
          <CustomButton onClick={handleOpenAlert}>
            <ButtonLabel>Choose</ButtonLabel>
            <ButtonLabel>Song</ButtonLabel>
          </CustomButton>
          <CustomButton onClick={handleChooseFileClick}>
            <ButtonLabel>Choose{"\n"}Local File</ButtonLabel>
          </CustomButton>
          <input
            type="file"
            id="input"
            accept="audio/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </ButtonColumn>
        <NowPlayingAndSeekRow>
          <div>{fileName && <p>Now Playing: {fileName}</p>}</div>
          <ControlRow>
            <PlayPauseButton onClick={togglePlayPause}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </PlayPauseButton>
            <Range
              id="seek"
              min={0}
              max={100}
              value={seekValue}
              onChange={handleSeekChange}
            />
          </ControlRow>
          <ControlRow>
            <Time variant="16x16_4" />
            <Range
              id="speed"
              min={0.1}
              max={2}
              step={0.1}
              value={speedValue}
              onChange={handleSpeedSliderChange}
            />
            <Mspaint variant="16x16_4" />
            <Range
              id="color"
              min={0}
              max={1}
              step={0.1}
              defaultValue={1}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                handleColorChange(value);
              }}
            />
          </ControlRow>
        </NowPlayingAndSeekRow>
      </TopRow>

      <ControlColumn style={{ marginBottom: '-10px' }}> {/* Adjusted to remove bottom whitespace */}
        <ControlRow>
          <Label>H </Label>
          <Range
            id="norm"
            min={10}
            max={300}
            defaultValue={90}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              handleNormChange(value);
            }}
          />
        </ControlRow>

        <ControlRow>
          <Label>N </Label>
          <Range
            id="fft"
            min={0}
            max={8}
            defaultValue={6}
            style={{ flex: 1 }}
            onChange={(e) => {
              const value = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192][e.target.value];
              handleFFTSizeChange(value);
            }}
          />
          <Label>&Tau; </Label>
          <Range
            id="tau"
            min={1}
            max={10}
            defaultValue={5}
            style={{ flex: 1 }}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              handleTauChange(value);
            }}
          />
        </ControlRow>

        <InlineControls>
          <ButtonGroup>
            <RadioButton
              id="off"
              name="memory"
              value="off"
              defaultChecked
              onChange={(e) => handleMemoryChange(e.target.value)}
            />
            <Label htmlFor="off">clean</Label>
            <RadioButton
              id="on"
              name="memory"
              value="on"
              onChange={(e) => handleMemoryChange(e.target.value)}
            />
            <Label htmlFor="on">memory</Label>
          </ButtonGroup>
          <ButtonGroup>
            <RadioButton
              id="osc"
              name="version"
              value="osc"
              defaultChecked
              onChange={(e) => handleVersionChange(e.target.value)}
            />
            <Label htmlFor="osc">osc</Label>
            <RadioButton
              id="bar"
              name="version"
              value="bar"
              onChange={(e) => handleVersionChange(e.target.value)}
            />
            <Label htmlFor="bar">bar</Label>
          </ButtonGroup>
        </InlineControls>
      </ControlColumn>
    </Container>
  );
};

export default ControlElements;