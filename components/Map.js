// components/Map.js
import React from 'react';
import { List, Modal } from '@react95/core';
import { Inetcpl1313 } from '@react95/icons';

const Map = ({ onClose, position }) => {
  return (
    <Modal
      closeModal={onClose}
      style={{
        width: '300px',
        height: '200px',
        left: position.x,
        top: position.y,
        maxWidth: '90%',
        maxHeight: '80%',
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
      <h1>Coming soon.</h1>
    </Modal>
  );
};

export default Map;
