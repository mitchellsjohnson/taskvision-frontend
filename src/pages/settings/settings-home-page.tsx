import React from 'react';
import { Link } from 'react-router-dom';

interface CardProps {
  to: string;
  title: string;
  description: string;
  icon: string;
}

const Card: React.FC<CardProps> = ({ to, title, description, icon }) => (
  <Link
    to={to}
    className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-6 text-white transition-all hover:bg-gray-700 hover:border-blue-500"
  >
    <div className="text-2xl mr-6">{icon}</div>
    <div className="flex-grow">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
    <div className="text-gray-500 text-2xl">→</div>
  </Link>
);

export const SettingsHomePage: React.FC = () => {
  const cards = [
    {
      to: '/settings/personal-info',
      title: 'Personal info',
      description: 'Provide personal details and how we can reach you',
      icon: '👤',
    },
    {
      to: '/settings/auth0-views',
      title: 'Auth0 Views Legacy',
      description: 'Legacy views for Auth0 settings',
      icon: '🔒',
    },
    {
      to: '/settings/section-x',
      title: 'Section X (TODO)',
      description: 'Manage settings for Section X',
      icon: '⚙️',
    },
    {
      to: '/settings/section-y',
      title: 'Section Y (TODO)',
      description: 'Manage settings for Section Y',
      icon: '📊',
    },
    {
      to: '/settings/section-z',
      title: 'Section Z (TODO)',
      description: 'Manage settings for Section Z',
      icon: '🔧',
    },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-2">Account</h1>
      <p className="text-gray-400 mb-10">
        Manage your account settings and preferences.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Card key={card.to} {...card} />
        ))}
      </div>
    </div>
  );
}; 