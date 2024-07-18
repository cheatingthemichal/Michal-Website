import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { TaskBar, List } from '@react95/core';
import { Notepad, Msacm3210, Inetcpl1313, Awfxcg321304, Cachevu100, Mmsys120, Folder } from '@react95/icons';
import ReadMeWindow from '../components/ReadMeWindow';
import MusicWindow from '../components/MusicWindow/MusicWindow';
import Synth from '../components/Synth.js';
import Map from '../components/Map.js';
import ProjectsModal from '../components/ProjectsModal';
import styled from 'styled-components';

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

  const handleReadMeClick = () => { setShowReadMe(true); };
  const handleReadMeClose = () => { setShowReadMe(false); };

  const handleMusicClick = () => { setShowMusic(true); };
  const handleMusicClose = () => { setShowMusic(false); };

  const handleSynthClick = () => { setShowSynth(true); };
  const handleSynthClose = () => { setShowSynth(false); };

  const handleMapClick = () => { setShowMap(true); };
  const handleMapClose = () => { setShowMap(false); };

  const handleProjectsClick = () => { setShowProjects(true); setCurrentProject(null); };
  const handleProjectsClose = () => { setShowProjects(false); setCurrentProject(null); };

  const selectProject = (project) => { setCurrentProject(project); };

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
        <title>Michal's Website</title>
        <link rel="icon" href="/eye.png" />
      </Head>

      <Canvas ref={canvasRef}></Canvas>

      <Content>
        <IconContainer onClick={handleReadMeClick}>
          <Notepad variant="32x32_4" />
          <div>README.txt</div>
        </IconContainer>

        <IconContainer onClick={handleMusicClick}>
          <Msacm3210 variant="32x32_4" />
          <div>MyMusicVisualizer.exe</div>
        </IconContainer>

        <IconContainer onClick={handleSynthClick}>
          <Mmsys120 variant="32x32_4" />
          <div>MySynthesizer.exe</div>
        </IconContainer>

        <IconContainer onClick={handleMapClick}>
          <Inetcpl1313 variant="48x48_4" />
          <div>MyMountainFinder.exe</div>
        </IconContainer>

        <IconContainer onClick={handleProjectsClick}>
          <Folder variant="32x32_4" />
          <div>MyProjects</div>
        </IconContainer>

        {showReadMe && <ReadMeWindow onClose={handleReadMeClose} />}
        {showMusic && <MusicWindow onClose={handleMusicClose} canvasRef={canvasRef} isOpen={showMusic} />}
        {showSynth && <Synth onClose={handleSynthClose} />}
        {showMap && <Map onClose={handleMapClose} />}
        {showProjects && (
          <ProjectsModal 
            onClose={handleProjectsClose} 
            selectProject={selectProject} 
            currentProject={currentProject} 
          />
        )}
      </Content>

      <TaskBar
        list={
          <List>
            <List.Item icon={<Awfxcg321304 variant="32x32_4" />} onClick={() =>
              window.open('https://www.linkedin.com/in/micha%C5%82-haj%C5%82asz-9ba5a8224/', '_blank')?.focus()
            }>LinkedIn</List.Item>
            <List.Item icon={<Cachevu100 variant="32x32_4" />} onClick={() =>
              window.open('https://github.com/cheatingthemichal/nextjs-project/', '_blank')?.focus()
            }>Source Code</List.Item>
          </List>
        }
      />
    </Container>
  );
};

export default Home;
