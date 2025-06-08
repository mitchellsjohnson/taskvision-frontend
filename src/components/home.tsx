import React from "react";

export const Home: React.FC = () => {
  return (
    <div className="hero-banner hero-banner--aqua-emerald">
      <h1 className="hero-banner__headline">Welcome to TaskVision</h1>
      <p className="hero-banner__description">
        AI-Powered Focus. Human-Centered Results.
      </p>
      <p className="hero-banner__description">
        TaskVision helps you cut through the noise and get the right things
        done.
      </p>
      {/* eslint-disable-next-line prettier/prettier */}
      <p className="hero-banner__description">
        🚀 Built on the MIT Framework (Most Important Tasks), TaskVision uses AI
        to:
      </p>
      {/* The above comment is for the single paragraph only. Now for the UL: */}
      {/* eslint-disable prettier/prettier */}
      <ul>
        <li>Surface your highest-impact priorities — before your day begins</li>
        <li>Learn your patterns and optimize how you work</li>
        <li>
          Keep you focused with ranked, role-aware, personalized task lists
        </li>
        <li>Track progress and trends that actually matter</li>
      </ul>
      {/* eslint-enable prettier/prettier */}
      <p className="hero-banner__description">
        Because doing less — intentionally — is how you achieve more.
      </p>
      <p className="hero-banner__description">
        <strong>
          TaskVision: Focused work. Powered by AI. Designed for impact.
        </strong>
      </p>
    </div>
  );
};
