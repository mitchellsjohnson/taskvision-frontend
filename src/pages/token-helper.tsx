import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const TokenHelperPage: React.FC = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      if (isAuthenticated) {
        try {
          const accessToken = await getAccessTokenSilently();
          setToken(accessToken);
        } catch (err: any) {
          setError(err.message || 'Failed to get token');
        }
      }
    };

    fetchToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', fontFamily: 'monospace' }}>
        <h1>🔄 Loading...</h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '40px', fontFamily: 'monospace' }}>
        <h1>🔐 Auth0 Token Helper</h1>
        <p>You need to be logged in to get your token.</p>
        <button 
          onClick={() => loginWithRedirect()}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            cursor: 'pointer',
            background: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '6px'
          }}
        >
          Log In
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', fontFamily: 'monospace', color: 'red' }}>
        <h1>❌ Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '1200px' }}>
      <h1>🎫 Your Auth0 Access Token</h1>
      
      <div style={{ 
        background: '#1e1e1e', 
        color: '#00ff00', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px',
        marginBottom: '20px',
        wordBreak: 'break-all',
        fontSize: '14px',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {token || 'Loading token...'}
      </div>

      {token && (
        <>
          <button 
            onClick={copyToClipboard}
            style={{ 
              padding: '12px 24px', 
              fontSize: '16px',
              cursor: 'pointer',
              background: copied ? '#10B981' : '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              marginRight: '10px',
              transition: 'background 0.2s'
            }}
          >
            {copied ? '✅ Copied!' : '📋 Copy Token'}
          </button>

          <div style={{ marginTop: '30px', padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
            <h2>📝 Next Steps:</h2>
            <ol style={{ lineHeight: '1.8' }}>
              <li>Click the "Copy Token" button above</li>
              <li>Go to your terminal where the load test script is waiting</li>
              <li>Paste the token and press Enter</li>
              <li>Watch the script create 300 tasks!</li>
            </ol>
          </div>

          <div style={{ marginTop: '20px', padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
            <h3>⚠️ Security Note</h3>
            <p style={{ margin: '10px 0' }}>
              This token provides access to your account. Keep it secure and don't share it with anyone.
              It will expire automatically.
            </p>
          </div>

          <div style={{ marginTop: '20px', padding: '15px', background: '#e0e7ff', borderRadius: '8px' }}>
            <h3>🔍 Token Info</h3>
            <p><strong>Length:</strong> {token.length} characters</p>
            <p><strong>Expires:</strong> Typically in 24 hours (depends on Auth0 config)</p>
          </div>
        </>
      )}
    </div>
  );
};

