import React from 'react';

export const Home: React.FC = () => {
  return (
    <div className="hero-banner hero-banner--aqua-emerald" data-testid="home-container">
      <h1 className="hero-banner__headline">Welcome to TaskVision</h1>
      <p className="hero-banner__description">AI-Powered Focus. Human-Centered Results.</p>
      <p className="hero-banner__description">
        TaskVision helps you cut through the noise and get the right things done.
      </p>
      <p className="hero-banner__description">
        🚀 Built on the MIT Framework (Most Important Tasks), TaskVision uses AI to:
      </p>
      <ul>
        <li>Surface your highest-impact priorities — before your day begins</li>
        <li>Learn your patterns and optimize how you work</li>
        <li>Keep you focused with ranked, role-aware, personalized task lists</li>
        <li>Track progress and trends that actually matter</li>
      </ul>
      <p className="hero-banner__description">Because doing less — intentionally — is how you achieve more.</p>
      <p className="hero-banner__description">
        <strong>TaskVision: Focused work. Powered by AI. Designed for impact.</strong>
      </p>
    </div>
  );
};
