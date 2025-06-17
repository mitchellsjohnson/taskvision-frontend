import React from 'react';
import { Outlet } from 'react-router-dom';
import { SettingsLeftNav } from '../../components/navigation/left/settings-left-nav';

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex h-full bg-gray-900 text-white">
      <SettingsLeftNav />
      <div className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </div>
    </div>
  );
}; 