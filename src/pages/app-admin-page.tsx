import React from "react";
import { PageLayout } from "../components/page-layout";

export const AppAdminPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="content-layout">
        <h1 id="page-title" className="content__title">
          Admin Panel
        </h1>
        <div className="content__body">
          <p>
            TODO: Admin functionality. You are seeing this page because you have
            the &apos;admin&apos; or &apos;ecosystem-admin&apos; role.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};
