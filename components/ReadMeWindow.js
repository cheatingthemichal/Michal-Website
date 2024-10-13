// components/ReadMeWindow.js
import React, { useState } from 'react';
import { List, Modal } from '@react95/core';
import { Notepad } from '@react95/icons';

const ReadMeWindow = ({ onClose, index, total, position }) => {
  const initialText = `Hi! My name is Michal Hajlasz and this is my website. 
          
I built it in Next.js with the React95 component library.

Here, you can find some apps and other things I've built.

You can contact me at: michalhajlasz@gmail.com.`;

  const [text, setText] = useState(initialText);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  return (
    <Modal
      closeModal={onClose}
      style={{
        width: '350px',
        height: '190px',
        left: position.x,
        top: position.y,
        maxWidth: '90%',
        maxHeight: '80%',
        overflow: 'auto',
        zIndex: 1000 + index,
      }}
      icon={<Notepad variant="16x16_4" />}
      title="README.txt"
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
      <textarea
        style={{ width: '100%', height: '100%', resize: 'none' }}
        value={text}
        onChange={handleTextChange}
      />
    </Modal>
  );
};

export default ReadMeWindow;
