import React from 'react';

export const DropIndicator = () => {
  const lineStyle: React.CSSProperties = {
    height: '4px',
    width: '100%',
    backgroundColor: 'red',
    borderRadius: '2px',
    position: 'relative',
  };

  const triangleStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '0px',
    transform: 'translate(-100%, -50%)',
    width: '0',
    height: '0',
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    borderLeft: '12px solid red',
  };

  return (
    <div style={lineStyle}>
      <div style={triangleStyle} />
    </div>
  );
}; 