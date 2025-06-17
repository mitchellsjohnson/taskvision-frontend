import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="content-layout">
      <h1 id="page-title" className="content__title">
        Dashboard
      </h1>
      <div className="content__body">
        <p id="page-description">
          <span>This is the dashboard.</span>
        </p>
      </div>
    </div>
  );
};
