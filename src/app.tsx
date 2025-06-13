import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </FontSizeProvider>
  );
};
