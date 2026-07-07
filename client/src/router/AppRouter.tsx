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


import { AdminLayout } from '../layouts/admin/AdminLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/users/AdminUsersPage';
import { AdminRolesPage } from '../pages/admin/roles/AdminRolesPage';
import { AdminAISettingsPage } from '../pages/admin/settings/AdminAISettingsPage';
import { AdminDocumentsPage } from '../pages/admin/documents/AdminDocumentsPage';
import { AdminKnowledgePage } from '../pages/admin/knowledge/AdminKnowledgePage';
import { AdminQueriesPage } from '../pages/admin/queries/AdminQueriesPage';
import { SupportPage } from '../pages/public/SupportPage';

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
      // Other routes fallback to placeholders or same view for now
      { path: 'history', element: <ActivityPage /> },
      { path: 'bookmarks', element: <ActivityPage /> },
      { path: 'collections', element: <ActivityPage /> },
      { path: 'achievements', element: <ActivityPage /> },
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
      { path: 'search', element: <SearchPage /> },
      { path: 'support', element: <SupportPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: <Navigate to="/app/dashboard" replace />
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
      { path: 'knowledge', element: <AdminKnowledgePage /> },
      { path: 'documents', element: <AdminDocumentsPage /> },
      { path: 'queries', element: <AdminQueriesPage /> },
      { path: 'ai', element: <AdminAISettingsPage /> },
      { path: 'search', element: <div className="p-8">Search Settings coming soon</div> },
      { path: 'analytics', element: <div className="p-8">Analytics coming soon</div> },
      { path: 'system', element: <div className="p-8">System Settings coming soon</div> },
      { path: 'logs', element: <div className="p-8">Logs coming soon</div> },
      { path: 'backups', element: <div className="p-8">Backups coming soon</div> },
      { path: 'security', element: <div className="p-8">Security coming soon</div> },
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
