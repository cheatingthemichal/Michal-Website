// utils/getModalPosition.js
const getModalPosition = (modalType, width, height) => {
  const modalWidth = 300;
  const modalHeight = 200;

  const positions = {
    ReadMe: {
      x: Math.max((width - modalWidth) / 2, 10), // Centered horizontally
      y: 50, // Fixed vertical position
    },
    Music: {
      x: 50, // Fixed horizontal position
      y: 100, // Fixed vertical position
    },
    Synth: {
      x: width - modalWidth - 300, // Fixed to the right
      y: 70,
    },
    Map: {
      x: 50,
      y: height - modalHeight - 100, // Fixed to the bottom
    },
    Projects: {
      x: width - modalWidth - 50,
      y: height - modalHeight - 100,
    },
    Map: {
      x: width - modalWidth - 1100,
      y: 170
    }
  };

  // Adjust for mobile view if necessary
  if (width < 600) {
    return {
      x: Math.max((width - modalWidth) / 2, 10),
      y: 50 + (positions[modalType]?.y || 0),
    };
  }

  return positions[modalType] || {
    x: Math.max((width - modalWidth) / 2, 10),
    y: Math.max((height - modalHeight) / 2, 10),
  };
};

export default getModalPosition;
