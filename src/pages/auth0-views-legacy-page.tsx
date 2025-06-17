import React from 'react';
import { Link } from 'react-router-dom';

export const Auth0ViewsLegacyPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold">Auth0 Views (Legacy)</h1>
      <p className="mt-4">
        These links demonstrate Auth0 authentication and role-based access control within the settings layout.
      </p>
      <ul className="list-disc list-inside mt-4 space-y-2">
        <li>
          <Link to="/settings/profile" className="text-white hover:underline">
            Profile Page
          </Link>
        </li>
        <li>
          <Link to="/settings/public" className="text-white hover:underline">
            Public Page
          </Link>
        </li>
        <li>
          <Link to="/settings/protected" className="text-white hover:underline">
            Protected Page
          </Link>
        </li>
        <li>
          <Link to="/settings/admin" className="text-white hover:underline">
            Admin Page
          </Link>
        </li>
        <li>
          <Link to="/settings/ecosystem-admin" className="text-white hover:underline">
            Ecosystem Admin Page
          </Link>
        </li>
      </ul>
    </div>
  );
}; 