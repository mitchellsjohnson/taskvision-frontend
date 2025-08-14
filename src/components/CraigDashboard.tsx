import React, { useEffect } from 'react';

interface SampleDashboardProps {
  onDataUpdate: (data: any) => void;
  cachedData: any;
}

export const SampleDashboard: React.FC<SampleDashboardProps> = ({ 
  onDataUpdate, 
  cachedData 
}) => {
  useEffect(() => {
    // Simulate data loading
    if (!cachedData) {
      setTimeout(() => {
        onDataUpdate({ loaded: true, timestamp: Date.now() });
      }, 100);
    }
  }, [onDataUpdate, cachedData]);

  return (
    <div className="sample-dashboard">
      <div className="sample-message-container">
        <h1 className="sample-message blinking">Hey How are yall doing?</h1>
        <p className="sample-subtitle">SAMPLE Dashboard</p>
        {cachedData && (
          <p className="cache-info">Dashboard loaded at {new Date(cachedData.timestamp).toLocaleTimeString()}</p>
        )}
      </div>
    </div>
  );
};
