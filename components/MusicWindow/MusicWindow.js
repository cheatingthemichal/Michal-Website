// components/MusicWindow/MusicWindow.js
import React, { useState, useEffect } from 'react';
import { List, Modal } from '@react95/core';
import { Computer, Folder, Mplayer15 } from '@react95/icons';
import ControlElements from './ControlElements';
import useMusicVisualizer from './useMusicVisualizer';
import ReactDOM from 'react-dom';

const MusicWindow = ({
  onClose,
  canvasRef,
  isOpen,
  position,
}) => {
  const [fileName, setFileName] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [showSongModal, setShowSongModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const {
    handleFileChange,
    handleSongSelect,
    stopVisualizer,
    audioRef,
    ...controlHandlers
  } = useMusicVisualizer(canvasRef);

  const preloadedSongs = [
    { name: 'Amor', url: '/Amor.mp3' },
    { name: 'Bills Like Jean Spirit', url: '/Bills Like Jean Spirit.mp3' },
    { name: 'Scary Monsters And Nice Sprites', url: '/Scary Monsters And Nice Sprites.mp3' },
    { name: 'Toxicity', url: '/Toxicity.mp3' },
    { name: "I'll Be Lucky Someday", url: "/Ill Be Lucky Someday.mp3" },
    { name: 'SC-9', url: '/SC-9.mp3' },
  ];

  const handleOpenSongModal = () => setShowSongModal(true);
  const handleCloseSongModal = () => setShowSongModal(false);

  const handleSongSelectAndPlay = (name, url) => {
    handleSongSelect(url);
    setFileName(name);
    setShowSongModal(false);
    setIsPlaying(true);
  };

  const updateFileName = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      setFileName(files[0].name.replace(/\.mp3$/, ''));
      setIsPlaying(true);
    }
    handleFileChange(event);
  };

  useEffect(() => {
    let interval;
    if (isOpen && audioRef.current) {
      interval = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (!isOpen) {
        stopVisualizer();
      }
    };
  }, [isOpen, stopVisualizer, audioRef]);

  return (
    <Modal
      closeModal={() => {
        stopVisualizer();
        onClose();
      }}
      style={{
        width: '400px',
        height: 'auto',
        left: position.x,
        top: position.y,
        maxWidth: '90%',
        maxHeight: '80%',
        overflow: 'auto',
        zIndex: 1000,
      }}
      icon={<Computer variant="16x16_4" />}
      title="MyMusicVisualizer.exe"
      menu={[
        {
          name: 'Options',
          list: (
            <List width="200px">
              <List.Item
                onClick={() => {
                  stopVisualizer();
                  onClose();
                }}
              >
                Close
              </List.Item>
            </List>
          ),
        },
      ]}
    >
      <ControlElements
        fileName={fileName}
        onFileChange={updateFileName}
        handleOpenAlert={handleOpenSongModal}
        currentTime={currentTime}
        duration={audioRef.current ? audioRef.current.duration : 0}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        {...controlHandlers}
      />
      {showSongModal &&
        ReactDOM.createPortal(
          <Modal
            closeModal={handleCloseSongModal}
            style={{
              width: '300px',
              height: 'auto',
              left: position.x, // Adjust position as needed
              top: position.y, // Adjust position as needed
              maxWidth: '90%',
              maxHeight: '80%',
              overflow: 'auto',
              zIndex: 10000, // Use a high zIndex to ensure it's on top
              position: 'fixed', // Ensure it's positioned relative to the viewport
            }}
            icon={<Folder variant="16x16_4" />}
            title="Choose a Song"
            menu={[]}
          >
            <div style={{ padding: '10px' }}>
              {preloadedSongs.map((song) => (
                <div
                  key={song.url}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    margin: '5px 0',
                  }}
                  onClick={() => handleSongSelectAndPlay(song.name, song.url)}
                >
                  <Mplayer15 variant="32x32_4" style={{ marginRight: 8 }} />
                  {song.name}
                </div>
              ))}
            </div>
          </Modal>,
          document.body // Render the modal at the root of the DOM
        )}
      <audio
        id="audio"
        ref={audioRef}
        controls
        style={{ display: 'none' }}
      ></audio>
    </Modal>
  );
};

export default MusicWindow;
