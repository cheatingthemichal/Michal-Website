import React, { useState, useEffect } from 'react';
import { List, Modal } from '@react95/core';
import { Computer, Folder, Mplayer15 } from '@react95/icons';
import ControlElements from './ControlElements';
import useMusicVisualizer from './useMusicVisualizer';

const MusicWindow = ({ onClose, canvasRef, isOpen }) => {
  const [fileName, setFileName] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [showSongModal, setShowSongModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { handleFileChange, handleSongSelect, stopVisualizer, audioRef, ...controlHandlers } = useMusicVisualizer(canvasRef);

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
  }, [isOpen, stopVisualizer]);

  return (
    <Modal
      closeModal={() => {
        stopVisualizer();
        onClose();
      }}
      style={{ width: '400px', height: 'auto' }}
      icon={<Computer variant="16x16_4" />}
      title="MyMusicVisualizer.exe"
      defaultPosition={{
        x: Math.floor(window.innerWidth / 2) - 600,
        y: Math.floor(window.innerHeight / 2) - 380,
      }}
      menu={[
        {
          name: 'Options',
          list: (
            <List width="200px">
              <List.Item onClick={() => {
                stopVisualizer();
                onClose();
              }}>Close</List.Item>
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
      {showSongModal && (
        <Modal
          closeModal={handleCloseSongModal}
          style={{ width: '300px', height: 'auto' }}
          icon={<Folder variant="16x16_4" />}
          title="Choose a Song"
          defaultPosition={{
            x: Math.floor(window.innerWidth / 2) - 375,
            y: Math.floor(window.innerHeight / 2) - 395,
          }}
        >
          <div style={{ padding: '10px' }}>
            {preloadedSongs.map((song) => (
              <div
                key={song.url}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: '5px 0' }}
                onClick={() => handleSongSelectAndPlay(song.name, song.url)}
              >
                <Mplayer15 variant="32x32_4" style={{ marginRight: 8 }} />
                {song.name}
              </div>
            ))}
          </div>
        </Modal>
      )}
      <audio id="audio" ref={audioRef} controls style={{ display: 'none' }}></audio>
    </Modal>
  );
};

export default MusicWindow;
