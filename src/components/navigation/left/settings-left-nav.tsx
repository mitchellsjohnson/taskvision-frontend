import React from 'react';
import { NavLink } from 'react-router-dom';

export const SettingsLeftNav: React.FC = () => {
  const navItems = [
    { path: '/settings', name: 'Home', exact: true },
    { path: '/settings/personal-info', name: 'Personal info (TODO)' },
    { path: '/settings/auth0-views', name: 'Auth0 Views Legacy' },
    { path: '/settings/section-x', name: 'Section X (TODO)' },
    { path: '/settings/section-y', name: 'Section Y (TODO)' },
    { path: '/settings/section-z', name: 'Section Z (TODO)' },
  ];

  return (
    <nav className="w-72 bg-gray-900 border-r border-gray-700 flex flex-col p-6">
      <h2 className="text-2xl font-semibold text-white mb-6 pl-3">Settings</h2>
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
              end={item.exact}
            >
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}; 