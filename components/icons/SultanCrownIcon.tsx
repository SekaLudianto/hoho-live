import React from 'react';

export const SultanCrownIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
        style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}
    >
      <path d="M5,16L3,5L8.5,10.5L12,4L15.5,10.5L21,5L19,16H5M19,19a2,2 0 0 1-2,2H7a2,2 0 0 1-2-2V17H19V19Z" />
    </svg>
  );
};
