import React from "react";
import { PageLayout } from "../components/page-layout";

export const DashboardPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="content-layout">
        <h1 id="page-title" className="content__title">
          Dashboard
        </h1>
        <div className="content__body">
          <p>TODO: Dashboard content will go here.</p>
        </div>
      </div>
    </PageLayout>
  );
};
