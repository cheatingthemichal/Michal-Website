import React from 'react';
import { List, Modal, Button } from '@react95/core';
import { Folder, Wmsui321001, Defrag } from '@react95/icons';

const ProjectsModal = ({
  onClose,
  selectProject,
  currentProject,
  position,
}) => {
  const renderContent = () => {
    switch (currentProject) {
      case 'Research':
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '10px',
              padding: '0 10px',
            }}
          >
            <div onClick={() => window.open('https://doi.org/10.1093/pnasnexus/pgae308', '_blank')?.focus()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Wmsui321001 variant="32x32_4" />
              <p style={{ margin: '4px 0' }}>
                My<br />
                Research<br />
                Paper
              </p>
            </div>
            <div onClick={() => window.open('https://github.com/cheatingthemichal/USCOVID-Mobility-Predictability', '_blank')?.focus()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Defrag variant="32x32_4"/>
              <p style={{ margin: '4px 0' }}>
                Code and<br />
                Data
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '10px',
              padding: '0 10px',
            }}
          >
            <div onClick={() => selectProject('Research')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Folder variant="32x32_4"/>
              <p style={{ margin: '4px 0' }}>
                Research
              </p>
            </div>
          </div>
        );
    }
  };

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
      icon={<Folder variant="16x16_4" />}
      title="MyProjects"
      menu={[
        {
          name: 'Options',
          list: (
            <List width="200px">
              <List.Item onClick={onClose}>Close</List.Item>
              {currentProject && <List.Item onClick={() => selectProject(null)}>Back</List.Item>}
            </List>
          ),
        }
      ]}
    >
      {renderContent()}
      {currentProject && (
        <Button
          style={{ position: 'absolute', bottom: '10px', right: '10px' }}
          onClick={() => selectProject(null)}
        >
          Back
        </Button>
      )}
    </Modal>
  );
};

export default ProjectsModal;
