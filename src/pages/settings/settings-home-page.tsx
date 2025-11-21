import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

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
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!isAuthenticated) return;

      try {
        const accessToken = await getAccessTokenSilently();
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const roles = payload['https://taskvision.app/roles'] || [];
        setUserRoles(roles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        // In local dev with auth disabled, grant ecosystem-admin role
        setUserRoles(['ecosystem-admin']);
      }
    };

    fetchUserRoles();
  }, [isAuthenticated, getAccessTokenSilently]);

  // In local dev (localhost), always show ecosystem admin features
  const isLocalDev = window.location.hostname === 'localhost';
  const hasEcosystemAdminRole = isLocalDev || userRoles.includes('ecosystem-admin');

  // Debug logging
  console.log('[Settings] isLocalDev:', isLocalDev);
  console.log('[Settings] userRoles:', userRoles);
  console.log('[Settings] hasEcosystemAdminRole:', hasEcosystemAdminRole);
  console.log('[Settings] hostname:', window.location.hostname);

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
      to: '/settings/sms',
      title: 'SMS / Text Messages',
      description: 'Manage tasks via SMS commands',
      icon: '📱',
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

  // Add Ecosystem Admin card only for ecosystem-admin users
  const allCards = hasEcosystemAdminRole
    ? [
        ...cards,
        {
          to: '/ecosystem-admin/sms-debug',
          title: 'Ecosystem Admin',
          description: 'SMS debug tools and system administration',
          icon: '🔧',
        },
      ]
    : cards;

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-2">Account</h1>
      <p className="text-gray-400 mb-10">
        Manage your account settings and preferences.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allCards.map((card) => (
          <Card key={card.to} {...card} />
        ))}
      </div>
    </div>
  );
}; 