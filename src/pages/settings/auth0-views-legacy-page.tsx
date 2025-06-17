import React from 'react';
import { Link } from 'react-router-dom';

export const Auth0ViewsLegacyPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Auth0 Legacy Views</h1>
      <p>These are links to the original pages included in the Auth0 React SDK sample.</p>
      <ul className="space-y-2 list-disc list-inside">
        <li>
          <Link to="/profile" className="text-blue-500 hover:underline">
            Profile Page
          </Link>
        </li>
        <li>
          <Link to="/public" className="text-blue-500 hover:underline">
            Public Page
          </Link>
        </li>
        <li>
          <Link to="/protected" className="text-blue-500 hover:underline">
            Protected Page
          </Link>
        </li>
        <li>
          <Link to="/admin" className="text-blue-500 hover:underline">
            Admin Page
          </Link>
        </li>
        <li>
          <Link to="/admin-features" className="text-blue-500 hover:underline">
            Admin Features Page
          </Link>
        </li>
      </ul>
    </div>
  );
}; 