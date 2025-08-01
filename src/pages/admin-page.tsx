import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect, useState } from 'react';
import { CodeSnippet } from '../components/code-snippet';
import { getAdminResource } from '../services/message.service';

export const AdminPage: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    let isMounted = true;

    const getMessage = async () => {
      const accessToken = await getAccessTokenSilently();
      const { data, error } = await getAdminResource(accessToken);

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
        Admin Page
      </h1>
      <div className="content__body">
        <p id="page-description">
          <span>
            This page retrieves an <strong>admin message</strong> from an external API.
          </span>
          <span>
            <strong>
              Only authenticated users with the <code>admin</code> role should access this page.
            </strong>
          </span>
        </p>
        <CodeSnippet title="Admin Message" code={message} />
      </div>
    </div>
  );
};
