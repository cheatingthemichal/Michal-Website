import React from 'react';
import { List, Modal, Button } from '@react95/core';
import { Folder, Progman15, Progman12, Sysmon1000, Msnp32WrkgrpIcon, Conflnk102, Wmsui321001, Defrag, Awfxcg321305 } from '@react95/icons';

const ProjectsModal = ({
  onClose,
  selectProject,
  currentProject,
  index,
  total,
  position,
}) => {
  const renderContent = () => {
    switch (currentProject) {
      case 'MLProjects':
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '10px',
              padding: '0 10px',
            }}
          >
            <div onClick={() => window.open('https://tinyurl.com/2p88hyu8', '_blank')?.focus()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Progman15 variant="32x32_4"/>
              <p style={{ margin: '4px 0' }}>
                Fully<br />
                Convolutional<br />
                Neural Network <br />
                for Predicting <br />
                Protein Binding<br />
                Sites
              </p>
            </div>
            <div onClick={() => window.open('https://tinyurl.com/mryd9nkm', '_blank')?.focus()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Progman12 variant="32x32_4"/>
              <p style={{ margin: '4px 0' }}>
                Neural Network<br />
                vs SVM <br />
                Performance <br />
                Comparison on <br />
                Varying Datasets
              </p>
            </div>
            <div onClick={() => window.open('https://tinyurl.com/3rz2hujr', '_blank')?.focus()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Sysmon1000 variant="32x32_4"/>
              <p style={{ margin: '4px 0' }}>
                Demonstration<br />
                of Double<br />
                Descent on<br />
                Fashion MNIST
              </p>
            </div>
          </div>
        );
      case 'OtherProjects':
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
            <div onClick={() => window.open('https://git.io/JyD8n', '_blank')?.focus()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Msnp32WrkgrpIcon variant="32x32_4"/>
              <p style={{ margin: '4px 0' }}>
                Full-Stack<br />
                Project in C
              </p>
            </div>
            <div onClick={() => window.open('https://purepoker.world', '_blank')?.focus()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Conflnk102 variant="32x32_4"/>
              <p style={{ margin: '4px 0' }}>
                Poker App<br />
                I am Building
              </p>
            </div>
          </div>
        );
      case 'Research':
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
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
                Research<br />
                Code and<br />
                Data
              </p>
            </div>
            <div onClick={() => window.open('https://github.com/cheatingthemichal/R-cluster-tutorial', '_blank')?.focus()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Awfxcg321305 variant="32x32_4"/>
              <p style={{ margin: '4px 0' }}>
                Tutorial<br />
                for Running<br />
                R Code<br />
                on Cluster
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
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
            <div onClick={() => selectProject('MLProjects')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Folder variant="32x32_4"/>
              <p style={{ margin: '4px 0' }}>
                ML Projects
              </p>
            </div>
            <div onClick={() => selectProject('OtherProjects')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <Folder variant="32x32_4"/>
              <p style={{ margin: '4px 0' }}>
                Other Projects
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
        zIndex: 1000 + index,
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
