import React from 'react';
import { DashboardTabs } from '../components/DashboardTabs';

export const DashboardPage: React.FC = () => {
  return (
    <DashboardTabs defaultTab="dashboard" />
  );
};
