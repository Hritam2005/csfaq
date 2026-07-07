import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Shield, FileText, 
  Menu, X, LogOut, ChevronDown, Gift, Home, Moon, Sun
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { setTheme } from '../../store/slices/themeSlice';
import { NotificationBell } from '../../components/ui/NotificationBell';
import { AuthService } from '../../services/AuthService';
import { ENV } from '../../config/env';

const sidebarNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Roles & Permissions', href: '/admin/roles', icon: Shield },
  { name: 'Spurti Redemptions', href: '/admin/redemptions', icon: Gift },
  { name: 'User Queries', href: '/admin/queries', icon: FileText },


];

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme);

  const toggleTheme = () => {
    dispatch(setTheme(mode === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      console.error('Logout failed on backend', e);
    }
    dispatch(logout());
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200 dark:border-gray-800 justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Hub</span>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="flex h-full flex-col overflow-y-auto pt-5 pb-20">
          <nav className="flex-1 space-y-1 px-3">
            {sidebarNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6 lg:px-8">
          <button
            type="button"
            className="md:hidden -ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 justify-end items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link 
              to="/" 
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Back to Home"
            >
              <Home className="h-5 w-5" />
            </Link>
            <NotificationBell />

            <div className="flex items-center gap-2 relative group cursor-pointer">
              {user?.avatar ? (
                <img 
                  src={user.avatar.startsWith('http') ? user.avatar : `${ENV.API_URL}/${user.avatar}`}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full object-cover border border-red-200 dark:border-red-900/40"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {(user?.fullName || user?.name || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.fullName || user?.name}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
              
              <div className="absolute right-0 top-full pt-1 w-48 hidden group-hover:block z-50">
                <div className="rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700 py-1">
                  <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
