import React from 'react';
import { useTheme } from '../contexts/theme-context';
import { Button } from './ui/Button';
import { Icon } from './icon';

export const DarkModeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center p-1 bg-secondary rounded-full shadow-lg border border-border">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTheme('light')}
        className="rounded-full"
        aria-label="Switch to Light Mode"
      >
        <Icon name="Sun" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTheme('dark')}
        className="rounded-full"
        aria-label="Switch to Dark Mode"
      >
        <Icon name="Moon" />
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => setTheme('system')}
        className="rounded-full"
        aria-label="Switch to System Theme"
      >
        <Icon name="Monitor" />
      </Button>
    </div>
  );
}; 