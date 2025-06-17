import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSize = 'small' | 'medium' | 'large';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  useEffect(() => {
    const savedSize = localStorage.getItem('fontSize') as FontSize;
    if (savedSize) {
      setFontSize(savedSize);
    }
  }, []);

  const handleSetFontSize = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize: handleSetFontSize }}>{children}</FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};
