// utils/getOpenModals.js
export const getOpenModals = ({
    showReadMe,
    showMusic,
    showSynth,
    showMap,
    showProjects,
  }) => {
    const modals = [];
    if (showReadMe) modals.push('ReadMe');
    if (showMusic) modals.push('Music');
    if (showSynth) modals.push('Synth');
    if (showMap) modals.push('Map');
    if (showProjects) modals.push('Projects');
    return modals;
  };
  export default getOpenModals;
  