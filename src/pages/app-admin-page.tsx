import React from 'react';

export const AppAdminPage: React.FC = () => {
  return (
    <div className="content-layout">
      <h1 id="page-title" className="content__title">
        App Admin Page
      </h1>
      <div className="content__body">
        <p id="page-description">
          <span>This page is for App Admins.</span>
        </p>
      </div>
    </div>
  );
};
