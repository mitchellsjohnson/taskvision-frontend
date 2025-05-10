import React from "react";

export const Home: React.FC = () => {
  return (
    <div className="hero-banner hero-banner--aqua-emerald">
      <h1 className="hero-banner__headline">Welcome to Opsvision 3</h1>
      <p className="hero-banner__description">
        This is an application that provides a way to share Key Performance
        Indicators (KPI) and Metrics with your organization via simple
        Dashboards.
      </p>
      <p className="hero-banner__description">
        Opsvision 3 consists of a React6 single-page app (SPA), Auth0 for
        authentication and a corresponding Express server (API) application.
      </p>
    </div>
  );
};
