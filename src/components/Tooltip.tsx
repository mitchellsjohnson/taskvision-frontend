import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative flex items-center">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md shadow-lg z-20">
          {text}
        </div>
      )}
    </div>
  );
}; 