// utils/getModalPosition.js
const getModalPosition = (index, total, width, height) => {
    if (width < 600) {
      // Mobile view: Centered and stacked vertically
      return {
        x: (width - 300) / 2, // Center horizontally
        y: 50 + index * 220, // Stack vertically with spacing
      };
    } else {
      // Desktop view: Spread around the screen
      const positions = [
        { x: width / 4 - 150, y: height / 4 - 100 },
        { x: (width / 2) - 150, y: (height / 2) - 100 },
        { x: (3 * width) / 4 - 150, y: height / 4 - 100 },
        { x: width / 4 - 150, y: (3 * height) / 4 - 100 },
        { x: (3 * width) / 4 - 150, y: (3 * height) / 4 - 100 },
      ];
      return positions[index] || { x: (width - 300) / 2, y: (height - 200) / 2 };
    }
  };
  
  export default getModalPosition;
  