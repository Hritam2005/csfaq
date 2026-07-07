import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { ErrorBoundary } from '../components/providers/ErrorBoundary';
import { AuthGate } from '../components/providers/AuthGate';

import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/public/HomePage';
import { PrivacyPolicyPage } from '../pages/public/PrivacyPolicyPage';
import { TermsConditionsPage } from '../pages/public/TermsConditionsPage';
import { FAQPage } from '../pages/knowledge/FAQPage';
import { FAQDetailsPage } from '../pages/knowledge/FAQDetailsPage';
import { CategoriesPage } from '../pages/knowledge/CategoriesPage';
import { SearchPage } from '../pages/search/SearchPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';
import { AboutPage } from '../pages/public/AboutPage';
import { ContactPage } from '../pages/public/ContactPage';
import { CookiesPolicyPage } from '../pages/public/CookiesPolicyPage';
import { AccessibilityPage } from '../pages/public/AccessibilityPage';
import { HelpCenterPage } from '../pages/public/HelpCenterPage';

import { AuthLayout } from '../layouts/AuthLayout';
import { ProfileLayout } from '../layouts/ProfileLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { ProfileOverviewPage } from '../pages/profile/ProfileOverviewPage';
import { SecuritySettingsPage } from '../pages/profile/SecuritySettingsPage';
import { SessionsPage } from '../pages/profile/SessionsPage';
import { PreferencesPage } from '../pages/profile/PreferencesPage';

import { AIWorkspaceLayout } from '../layouts/AIWorkspaceLayout';
import { ConversationPage } from '../pages/ai/ConversationPage';
import { AIHistoryPage } from '../pages/ai/AIHistoryPage';
import { AIBookmarksPage } from '../pages/ai/AIBookmarksPage';
import { AISettingsPage } from '../pages/ai/AISettingsPage';

import { DashboardLayout } from '../layouts/dashboard/DashboardLayout';
import { DashboardOverviewPage } from '../pages/dashboard/DashboardOverviewPage';
import { ActivityPage } from '../pages/dashboard/ActivityPage';
import { SpurtiPointsPage } from '../pages/dashboard/SpurtiPointsPage';


import { AdminLayout } from '../layouts/admin/AdminLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/users/AdminUsersPage';
import { AdminRolesPage } from '../pages/admin/roles/AdminRolesPage';
import { AdminQueriesPage } from '../pages/admin/queries/AdminQueriesPage';
import { AdminRedemptionsPage } from '../pages/admin/AdminRedemptionsPage';
import { SupportPage } from '../pages/public/SupportPage';

// Query-Triage microservice pages
import { MyQueriesPage } from '../pages/triage/user/MyQueriesPage';
import { NewQueryPage } from '../pages/triage/user/NewQueryPage';
import { QueryDetailPage } from '../pages/triage/user/QueryDetailPage';
import { TriageInboxPage } from '../pages/triage/admin/TriageInboxPage';
import { AdminQueryDetailPage } from '../pages/triage/admin/AdminQueryDetailPage';
import { TriageCapacityPage } from '../pages/triage/admin/TriageCapacityPage';
import { TriageWorkloadPage } from '../pages/triage/admin/TriageWorkloadPage';
import { IncidentDetailPage } from '../pages/triage/admin/IncidentDetailPage';

export const appRouter = createBrowserRouter([
  {
    path: '/profile',
    element: (
      <ErrorBoundary>
        <AuthGate>
          <ProtectedRoute>
            <ProfileLayout />
          </ProtectedRoute>
        </AuthGate>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <ProfileOverviewPage /> },
      { path: 'security', element: <SecuritySettingsPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'preferences', element: <PreferencesPage /> },
    ]
  },
  {
    path: '/ai',
    element: (
      <ErrorBoundary>
        <AuthGate>
          <ProtectedRoute>
            <AIWorkspaceLayout />
          </ProtectedRoute>
        </AuthGate>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Navigate to="/ai/chat" replace /> },
      { path: 'chat', element: <ConversationPage /> },
      { path: 'conversations/:id', element: <ConversationPage /> },
      { path: 'history', element: <AIHistoryPage /> },
      { path: 'bookmarks', element: <AIBookmarksPage /> },
      { path: 'settings', element: <AISettingsPage /> },
    ]
  },
  {
    path: '/app',
    element: (
      <ErrorBoundary>
        <AuthGate>
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        </AuthGate>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardOverviewPage /> },
      { path: 'activity', element: <ActivityPage /> },
      // Query-Triage user routes
      { path: 'queries', element: <Navigate to="/queries/my" replace /> },
      { path: 'queries/new', element: <Navigate to="/queries/new" replace /> },
      // Other routes fallback to placeholders or same view for now
      { path: 'history', element: <AIHistoryPage /> },
      { path: 'bookmarks', element: <AIBookmarksPage /> },
      { path: 'collections', element: <CategoriesPage /> },
      { path: 'collections/:categoryName', element: <FAQPage /> },
      { path: 'achievements', element: <SpurtiPointsPage /> },
      { path: 'learning', element: <ActivityPage /> },
      { path: 'settings', element: <ActivityPage /> },
    ]
  },
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password/:token', element: <ResetPasswordPage /> },
    ]
  },
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <AuthGate>
          <MainLayout />
        </AuthGate>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'privacy', element: <PrivacyPolicyPage /> },
      { path: 'terms', element: <TermsConditionsPage /> },
      { path: 'cookies', element: <CookiesPolicyPage /> },
      { path: 'accessibility', element: <AccessibilityPage /> },
      { path: 'help', element: <HelpCenterPage /> },
      { path: 'faqs', element: <FAQPage /> },
      { path: 'faqs/:id', element: <FAQDetailsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'categories/:categoryName', element: <FAQPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'support', element: <SupportPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: <Navigate to="/app/dashboard" replace />
  },
  // ---- Query-Triage user routes (also accessible while logged in) ---------
  {
    path: '/queries',
    element: (
      <ErrorBoundary>
        <AuthGate>
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        </AuthGate>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Navigate to="/queries/my" replace /> },
      { path: 'my', element: <MyQueriesPage /> },
      { path: 'new', element: <NewQueryPage /> },
      { path: ':id', element: <QueryDetailPage /> },
    ],
  },
  {
    path: '/support/queries',
    element: (
      <ErrorBoundary>
        <AuthGate>
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        </AuthGate>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Navigate to="/queries/my" replace /> },
      { path: 'my', element: <Navigate to="/queries/my" replace /> },
      { path: 'new', element: <Navigate to="/queries/new" replace /> },
      { path: ':id', element: <QueryDetailPage /> },
    ],
  },
  // ---- Query-Triage admin/resolver routes -------------------------------
  {
    path: '/admin/triage',
    element: (
      <ErrorBoundary>
        <AuthGate>
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        </AuthGate>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/triage/inbox" replace /> },
      { path: 'inbox', element: <TriageInboxPage /> },
      { path: 'inbox/:id', element: <AdminQueryDetailPage /> },
      { path: 'incident/:id', element: <IncidentDetailPage /> },
      { path: 'capacity', element: <TriageCapacityPage /> },
      { path: 'workload', element: <TriageWorkloadPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ErrorBoundary>
        <AuthGate>
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        </AuthGate>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'roles', element: <AdminRolesPage /> },
      { path: 'knowledge', element: <div className="p-8">Knowledge Management coming soon</div> },
      { path: 'queries', element: <AdminQueriesPage /> },
      { path: 'redemptions', element: <AdminRedemptionsPage /> },
    ]
  },
  {
    path: '/unauthorized',
    element: <div className="p-8 text-center text-xl text-red-500">403 Unauthorized Access</div>,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);