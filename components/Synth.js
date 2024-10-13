// components/Synth.js
import React from 'react';
import { List, Modal } from '@react95/core';
import { Mmsys120 } from '@react95/icons';

const Synth = ({ onClose, index, total, position }) => {
  return (
    <Modal
      closeModal={onClose}
      style={{
        width: '300px',
        height: '200px',
        left: position.x,
        top: position.y,
        maxWidth: '90%',       // Ensures responsiveness
        maxHeight: '80%',
        overflow: 'auto',
        zIndex: 1000 + index,  // Stacking order
      }}
      icon={<Mmsys120 variant="32x32_4" />}
      title="MySynthesizer.exe"
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

export default Synth;
