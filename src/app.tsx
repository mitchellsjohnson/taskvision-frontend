import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import { AccessibilityProvider } from './contexts/accessibility-context';
import { NavBar } from './components/navigation/desktop/nav-bar';
import { MobileNavBar } from './components/navigation/mobile/mobile-nav-bar';
import { SettingsPage } from './pages/settings-page';
import { DashboardPage } from './pages/dashboard-page';
import { TVAgentPage } from './pages/tvagent-page';
import WellnessPage from './pages/wellness-page';
import DeleteWellnessDataPage from './pages/delete-wellness-data';
import { DarkModeToggle } from './components/DarkModeToggle';

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
      <AccessibilityProvider>
        <div className="page-layout">
          <NavBar />
          <MobileNavBar />
          <DarkModeToggle />
          <main className="page-layout__main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProtectedRoute component={ProfilePage} />} />
            <Route path="/public" element={<PublicPage />} />
            <Route path="/protected" element={<ProtectedRoute component={ProtectedPage} />} />
            <Route path="/tasks" element={<ProtectedRoute component={TasksPage} />} />
            <Route path="/tvagent" element={<ProtectedRoute component={TVAgentPage} />} />
            <Route path="/wellness" element={<ProtectedRoute component={WellnessPage} />} />
            <Route path="/deleteMyWellnessData" element={<ProtectedRoute component={DeleteWellnessDataPage} />} />
            <Route path="/dashboard" element={<ProtectedRoute component={DashboardPage} />} />
            <Route
              path="/admin"
              element={<RoleProtectedRoute component={AdminPage} requiredRoles={['admin', 'ecosystem-admin']} />}
            />
            <Route
              path="/ecosystem-admin"
              element={<RoleProtectedRoute component={EcosystemAdminPage} requiredRoles={['ecosystem-admin']} />}
            />
            <Route path="/settings" element={<ProtectedSettingsPage />} />
            <Route path="/callback" element={<CallbackPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        </div>
      </AccessibilityProvider>
    </FontSizeProvider>
  );
};