import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import { PageLoader } from './components/page-loader';
import { ProtectedRoute } from './components/protected-route';
import { RoleProtectedRoute } from './components/role-protected-route';
import { HomePage } from './pages/home-page';
import { ProfilePage } from './pages/profile-page';
import { PublicPage } from './pages/public-page';
import { ProtectedPage } from './pages/protected-page';
import { AdminPage } from './pages/admin-page';
import { TasksPage } from './pages/tasks-page';
import { EcosystemAdminPage } from './pages/ecosystem-admin-page';
import { CallbackPage } from './pages/callback-page';
import { NotFoundPage } from './pages/not-found-page';
import { FontSizeProvider } from './contexts/font-size-context';
import { NavBar } from './components/navigation/desktop/nav-bar';
import { MobileNavBar } from './components/navigation/mobile/mobile-nav-bar';
import { SettingsPage } from './pages/settings-page';
import { Auth0ViewsLegacyPage } from './pages/auth0-views-legacy-page';
import { DashboardPage } from './pages/dashboard-page';

const ProtectedSettingsPage = withAuthenticationRequired(SettingsPage, {
  onRedirecting: () => (
    <div className="page-layout">
      <PageLoader />
    </div>
  ),
});

export const App: React.FC = () => {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="page-layout">
        <PageLoader />
      </div>
    );
  }

  return (
    <FontSizeProvider>
      <div className="page-layout">
        <NavBar />
        <MobileNavBar />
        <main className="page-layout__main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProtectedRoute component={ProfilePage} />} />
            <Route path="/public" element={<PublicPage />} />
            <Route path="/protected" element={<ProtectedRoute component={ProtectedPage} />} />
            <Route path="/tasks" element={<ProtectedRoute component={TasksPage} />} />
            <Route path="/dashboard" element={<ProtectedRoute component={DashboardPage} />} />
            <Route
              path="/admin"
              element={<RoleProtectedRoute component={AdminPage} requiredRoles={['admin', 'ecosystem-admin']} />}
            />
            <Route
              path="/ecosystem-admin"
              element={<RoleProtectedRoute component={EcosystemAdminPage} requiredRoles={['ecosystem-admin']} />}
            />
            <Route path="/settings" element={<ProtectedSettingsPage />}>
              <Route index element={<Navigate to="auth0-views" replace />} />
              <Route path="auth0-views" element={<Auth0ViewsLegacyPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="public" element={<PublicPage />} />
              <Route path="protected" element={<ProtectedRoute component={ProtectedPage} />} />
              <Route path="admin" element={<RoleProtectedRoute component={AdminPage} requiredRoles={['admin', 'ecosystem-admin']} />} />
              <Route path="ecosystem-admin" element={<RoleProtectedRoute component={EcosystemAdminPage} requiredRoles={['ecosystem-admin']} />} />
            </Route>
            <Route path="/callback" element={<CallbackPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </FontSizeProvider>
  );
};