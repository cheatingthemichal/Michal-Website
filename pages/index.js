// pages/index.js
import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { TaskBar, List } from '@react95/core';
import {
  Notepad,
  Msacm3210,
  Inetcpl1313,
  Awfxcg321304,
  Cachevu100,
  Mmsys120,
  Folder,
} from '@react95/icons';
import ReadMeWindow from '../components/ReadMeWindow';
import MusicWindow from '../components/MusicWindow/MusicWindow';
import Synth from '../components/SynthWindow/Synth.js';
import Map from '../components/Map.js';
import ProjectsModal from '../components/ProjectsModal';
import styled from 'styled-components';
import getOpenModals from '../utils/getOpenModals'; // Import the helper function
import useWindowSize from '../hooks/useWindowSize'; // Ensure you have this hook
import getModalPosition from '../utils/getModalPosition'; // Ensure you have this utility

const IconContainer = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 20px;

  * {
    cursor: pointer;
  }
`;

const Container = styled.div`
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
`;

const Home = () => {
  useEffect(() => {
    // Redirect to the Vercel site
    if (window.location.hostname === 'cheatingthemichal.github.io') {
      window.location.href = 'https://michalh.vercel.app/';
    }
  }, []);

  const [showReadMe, setShowReadMe] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showSynth, setShowSynth] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const canvasRef = useRef(null);
  const { width, height } = useWindowSize(); // Use the custom hook

  // Determine which modals are open and their order
  const openModals = getOpenModals({
    showReadMe,
    showMusic,
    showSynth,
    showMap,
    showProjects,
  });
  const total = openModals.length;

  // Function to render each modal with its index and total
  const renderModal = (modalType) => {
    const position = getModalPosition(modalType, width, height); // Calculate position based on modal type
  
    switch (modalType) {
      case 'ReadMe':
        return (
          <ReadMeWindow
            key={modalType}
            onClose={() => setShowReadMe(false)}
            position={position}
          />
        );
      case 'Music':
        return (
          <MusicWindow
            key={modalType}
            onClose={() => setShowMusic(false)}
            canvasRef={canvasRef}
            isOpen={showMusic}
            position={position}
          />
        );
      case 'Synth':
        return (
          <Synth
            key={modalType}
            onClose={() => setShowSynth(false)}
            position={position}
          />
        );
      case 'Map':
        return (
          <Map
            key={modalType}
            onClose={() => setShowMap(false)}
            position={position}
          />
        );
      case 'Projects':
        return (
          <ProjectsModal
            key={modalType}
            onClose={() => {
              setShowProjects(false);
              setCurrentProject(null);
            }}
            selectProject={setCurrentProject}
            currentProject={currentProject}
            position={position}
          />
        );
      default:
        return null;
    }
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const scale = window.devicePixelRatio;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.scale(scale, scale);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <Container>
      <Head>
        <title>Michal Hajlasz - Personal Website</title>
        <meta name="description" content="My name is Michal Hajlasz and this is my website." />
        <meta name="keywords" content="Michał Hajłasz, Michal Hajlasz, software developer, portfolio, projects, React, Next.js" />
        <meta name="author" content="Michal Hajlasz" />
        <meta property="og:title" content="Michal Hajlasz, Michał Hajłasz - Portfolio" />
        <meta property="og:description" content="Check out Michal Hajlasz's projects and work in software development, music visualizers, and more!" />
        <meta property="og:url" content="https://michalh.vercel.app/" />
        <link rel="icon" href="/eye.png" />
      </Head>

      <Canvas ref={canvasRef}></Canvas>

      <Content>
        <IconContainer onClick={() => setShowReadMe(true)}>
          <Notepad variant="32x32_4" />
          <div>README.txt</div>
        </IconContainer>

        <IconContainer onClick={() => setShowMusic(true)}>
          <Msacm3210 variant="32x32_4" />
          <div>MyMusicVisualizer.exe</div>
        </IconContainer>

        <IconContainer onClick={() => setShowSynth(true)}>
          <Mmsys120 variant="32x32_4" />
          <div>MySynthesizer.exe</div>
        </IconContainer>

        <IconContainer onClick={() => setShowMap(true)}>
          <Inetcpl1313 variant="48x48_4" />
          <div>MyMountainFinder.exe</div>
        </IconContainer>

        <IconContainer onClick={() => {
          setShowProjects(true);
          setCurrentProject(null);
        }}>
          <Folder variant="32x32_4" />
          <div>MyProjects</div>
        </IconContainer>

        {/* Render all open modals */}
        {openModals.map((modalType) => (
          <div key={modalType}>{renderModal(modalType)}</div>
        ))}
      </Content>

      <TaskBar
        list={
          <List>
            <List.Item
              icon={<Awfxcg321304 variant="32x32_4" />}
              onClick={() =>
                window
                  .open(
                    'https://www.linkedin.com/in/micha%C5%82-haj%C5%82asz-9ba5a8224/',
                    '_blank'
                  )
                  ?.focus()
              }
            >
              LinkedIn
            </List.Item>
            <List.Item
              icon={<Cachevu100 variant="32x32_4" />}
              onClick={() =>
                window
                  .open(
                    'https://github.com/cheatingthemichal/nextjs-project/',
                    '_blank'
                  )
                  ?.focus()
              }
            >
              Source Code
            </List.Item>
          </List>
        }
      />
    </Container>
  );
};

export default Home;
