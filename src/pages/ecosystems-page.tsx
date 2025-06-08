import React from "react";
import { PageLayout } from "../components/page-layout";

export const EcosystemsPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="content-layout">
        <h1 id="page-title" className="content__title">
          Ecosystem Management
        </h1>
        <div className="content__body">
          <p>
            TODO: Ecosystems Admin functionality. You are seeing this page
            because you have the &apos;ecosystem-admin&apos; role.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};
