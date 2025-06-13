import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoader } from './components/page-loader';
import { ProtectedRoute } from './components/protected-route';
import { RoleProtectedRoute } from './components/role-protected-route';

// Original Pages
import { AdminPage } from './pages/admin-page';
import { CallbackPage } from './pages/callback-page';
import { HomePage } from './pages/home-page';
import { NotFoundPage } from './pages/not-found-page';
import { ProfilePage } from './pages/profile-page';
import { ProtectedPage } from './pages/protected-page';
import { PublicPage } from './pages/public-page';
import { AdminFeaturesPage } from './pages/admin-features-page';

// New Pages
import { DashboardPage } from './pages/dashboard-page';
import { TasksPage } from './pages/tasks-page';
import { AppAdminPage } from './pages/app-admin-page';
import { EcosystemsPage } from './pages/ecosystems-page';
import { UnauthorizedPage } from './pages/unauthorized-page';
import { FontSizeProvider } from './contexts/font-size-context';

const DebugFrontendEnvPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [decodedToken, setDecodedToken] = useState<any>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getAccessTokenSilently();
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setDecodedToken(decoded);
      } catch (error) {
        console.error('Error fetching access token', error);
      }
    };
    fetchToken();
  }, [getAccessTokenSilently]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '14px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '5px', margin: '20px' }}>
      <h1>Frontend Environment Variables & Access Token</h1>
      <h2>Environment Variables</h2>
      <pre>
        <code>
          {JSON.stringify(
            {
              REACT_APP_AUTH0_DOMAIN: process.env.REACT_APP_AUTH0_DOMAIN || 'Not Set',
              REACT_APP_AUTH0_CLIENT_ID: process.env.REACT_APP_AUTH0_CLIENT_ID || 'Not Set',
              REACT_APP_AUTH0_CALLBACK_URL: process.env.REACT_APP_AUTH0_CALLBACK_URL || 'Not Set',
              REACT_APP_AUTH0_AUDIENCE: process.env.REACT_APP_AUTH0_AUDIENCE || 'Not Set',
            },
            null,
            2
          )}
        </code>
      </pre>
      <h2>Decoded Access Token</h2>
      {decodedToken ? (
        <pre>
          <code>{JSON.stringify(decodedToken, null, 2)}</code>
        </pre>
      ) : (
        <p>Fetching token...</p>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth0();

  if (isLoading) {
    return (
      <div className="page-layout">
        <PageLoader />
      </div>
    );
  }

  return (
    <FontSizeProvider>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />} />
        <Route path="/profile" element={<ProtectedRoute component={ProfilePage} />} />
        <Route path="/public" element={<PublicPage />} />
        <Route path="/protected" element={<ProtectedRoute component={ProtectedPage} />} />
        <Route path="/admin" element={<ProtectedRoute component={AdminPage} />} />
        <Route path="/admin-features" element={<ProtectedRoute component={AdminFeaturesPage} />} />
        <Route path="/dashboard" element={<ProtectedRoute component={DashboardPage} />} />
        <Route path="/tasks" element={<ProtectedRoute component={TasksPage} />} />
        <Route
          path="/app-admin"
          element={<RoleProtectedRoute component={AppAdminPage} requiredRoles={['admin', 'ecosystem-admin']} />}
        />
        <Route
          path="/ecosystems"
          element={<RoleProtectedRoute component={EcosystemsPage} requiredRoles={['ecosystem-admin']} />}
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/debug-frontend-env" element={<DebugFrontendEnvPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </FontSizeProvider>
  );
};
