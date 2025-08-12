import React from 'react';
import AnimatedPlusButton from './AnimatedPlusButton';

const ExampleUsage = () => {
  const handleAddClick = () => {
    console.log('Plus button clicked!');
    // Add your functionality here
    // For example: open a modal, navigate to a new page, etc.
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Mobile Plus Button Example</h2>
      
      {/* Floating Action Button (FAB) style */}
      <AnimatedPlusButton 
        onClick={handleAddClick}
        size={56}
        className="fab-button"
      />
      
      {/* Inline button */}
      <div style={{ marginTop: '100px' }}>
        <AnimatedPlusButton 
          onClick={handleAddClick}
          size={40}
          className="inline-button"
        />
      </div>
    </div>
  );
};

export default ExampleUsage;