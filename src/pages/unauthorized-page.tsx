import React from 'react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="content-layout">
      <h1 id="page-title" className="content__title">
        Unauthorized
      </h1>
      <div className="content__body">
        <p id="page-description">
          <span>You do not have permission to view this page.</span>
        </p>
      </div>
    </div>
  );
};
