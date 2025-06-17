import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect, useState } from 'react';
import { CodeSnippet } from '../components/code-snippet';
import { getEcosystemAdminResource } from '../services/message.service';

export const EcosystemAdminPage: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    let isMounted = true;

    const getMessage = async () => {
      const accessToken = await getAccessTokenSilently();
      const { data, error } = await getEcosystemAdminResource(accessToken);

      if (!isMounted) {
        return;
      }
      if (data) {
        setMessage(JSON.stringify(data, null, 2));
      }
      if (error) {
        setMessage(JSON.stringify(error, null, 2));
      }
    };

    getMessage();

    return () => {
      isMounted = false;
    };
  }, [getAccessTokenSilently]);

  return (
    <div className="content-layout">
      <h1 id="page-title" className="content__title">
        Ecosystem Admin Page
      </h1>
      <div className="content__body">
        <p id="page-description">
          <span>
            This page is for <strong>ecosystem-admin</strong> users.
          </span>
        </p>
        <CodeSnippet title="Ecosystem Admin Message" code={message} />
      </div>
    </div>
  );
}; 