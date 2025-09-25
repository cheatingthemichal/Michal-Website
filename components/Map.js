// components/Map.js
import React from 'react';
import { List, Modal } from '@react95/core';
import { Inetcpl1313 } from '@react95/icons';
import dynamic from 'next/dynamic';

// Load MountainFinder client-side only (it uses Leaflet)
const MountainFinder = dynamic(
  () => import('./MountainFinder/MountainFinder'),
  { ssr: false }
);

const Map = ({ onClose, position }) => {
  return (
    <Modal
      closeModal={onClose}
      style={{
        width: '750px',
        height: '600px',
        left: position.x,
        top: position.y,
        maxWidth: '95%',
        maxHeight: '95%',
        overflow: 'auto',
        zIndex: 1000,
      }}
      icon={<Inetcpl1313 variant="48x48_4" />}
      title="MyMountainFinder.exe"
      menu={[
        {
          name: 'Options',
          list: (
            <List width="200px">
              <List.Item onClick={onClose}>Close</List.Item>
            </List>
          ),
        },
      ]}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <MountainFinder />
      </div>
    </Modal>
  );
};

export default Map;
