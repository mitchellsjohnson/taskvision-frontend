import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { PageLoader } from '../components/page-loader';

export const CallbackPage: React.FC = () => {
  const { error } = useAuth0();

  if (error) {
    return (
      <div className="content-layout">
        <h1 id="page-title" className="content__title">
          Error
        </h1>
        <div className="content__body">
          <p id="page-description">
            <span>{error.message}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <PageLoader />
    </div>
  );
};
