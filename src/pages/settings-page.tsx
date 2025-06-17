import React from 'react';
import { Outlet } from 'react-router-dom';
import { LeftNav } from '../components/navigation/left/left-nav';

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex h-screen">
      <LeftNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};