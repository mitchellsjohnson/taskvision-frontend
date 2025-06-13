import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect, useState } from 'react';
import { CodeSnippet } from '../components/code-snippet';
import { getAdminFeatureResource } from '../services/message.service';

export const AdminFeaturesPage: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    let isMounted = true;

    const getMessage = async () => {
      const accessToken = await getAccessTokenSilently();
      const { data, error } = await getAdminFeatureResource(accessToken);

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
            This page retrieves the <strong>admin feature flag </strong> from an external API.
          </span>
          <span>
            <strong>
              Only authenticated users with the <code>read:admin-features</code> permission should access this page.
            </strong>
          </span>
        </p>
        <CodeSnippet title="Admin Feature Flag" code={message} />
      </div>
    </div>
  );
};
