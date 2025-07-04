import React from 'react';
import { CodeSnippet } from '../components/code-snippet';
import { getPublicResource } from '../services/message.service';

export const PublicPage: React.FC = () => {
  const [message, setMessage] = React.useState<string>('');

  React.useEffect(() => {
    let isMounted = true;

    const getMessage = async () => {
      const { data, error } = await getPublicResource();

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
  }, []);

  return (
    <div className="content-layout">
      <h1 id="page-title" className="content__title">
        Public Page
      </h1>
      <div className="content__body">
        <p id="page-description">
          <span>
            This page retrieves a <strong>public message</strong> from an external API.
          </span>
          <span>
            <strong>Any visitor can access this page.</strong>
          </span>
        </p>
        <CodeSnippet title="Public Message" code={message} />
      </div>
    </div>
  );
};
