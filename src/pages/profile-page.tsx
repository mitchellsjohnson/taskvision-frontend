import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { CodeSnippet } from '../components/code-snippet';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth0();

  if (!user) {
    return null;
  }

  return (
    <div className="content-layout">
      <h1 id="page-title" className="content__title">
        Profile Page
      </h1>
      <div className="content__body">
        <p id="page-description">
          <span>
            You can see information about your profile and the contents of your ID token here.
          </span>
        </p>
        <div className="profile-grid">
          <div className="profile__header">
            <img src={user.picture} alt="Profile" className="profile__avatar" />
            <div className="profile__headline">
              <h2 className="profile__title">{user.name}</h2>
              <span className="profile__description">{user.email}</span>
            </div>
          </div>
          <div className="profile__details">
            <CodeSnippet
              title="Decoded ID Token"
              code={JSON.stringify(user, null, 2)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
