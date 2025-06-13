import React from 'react';
import { PageLayout } from '../components/page-layout';

export const UnauthorizedPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="content-layout">
        <h1 id="page-title" className="content__title">
          Access Denied
        </h1>
        <div className="content__body">
          <p>You do not have the necessary permissions to view this page.</p>
        </div>
      </div>
    </PageLayout>
  );
};
