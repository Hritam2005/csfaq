import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import {
  Activity, Bookmark, Download, Folder, GraduationCap, History,
  LayoutDashboard, Settings, Upload, Award,
  MessageSquarePlus, Inbox, Send, UserCircle, LogOut, Moon, Sun, Home
} from 'lucide-react';
import { cn } from '../../components/ui/Button';
import { NotificationBell } from '../../components/ui/NotificationBell';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { useQuery } from '@tanstack/react-query';
import { TriageService } from '../../services/triage/TriageService';
import { logout } from '../../store/slices/authSlice';
import { setTheme } from '../../store/slices/themeSlice';
import { AuthService } from '../../services/AuthService';

export const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { mode } = useSelector((s: RootState) => s.theme);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    dispatch(setTheme(mode === 'dark' ? 'light' : 'dark'));
  };

  const userRole = (user?.role ?? '').toString();
  const isAdmin = userRole.toLowerCase().includes('admin') || userRole === 'Super Admin';

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      console.error('Logout failed on backend', e);
    }
    dispatch(logout());
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live count of user's open (non-resolved/non-closed) queries → drives the badge on "My Queries".
  const { data: myQueriesData } = useQuery({
    queryKey: ['my-open-queries-count'],
    queryFn: () => TriageService.getMyQueries({ limit: 1 }),
    enabled: !!isAuthenticated && !!user?._id,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
  });

  // We don't have a count of "open" specifically from a single endpoint,
  // so we conservatively use the total — the page itself shows status filters.
  const myQueriesTotal = myQueriesData?.total ?? 0;
  const navItems = [
    { name: 'Overview', to: '/app/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'My Queries', to: '/queries/my', icon: Inbox, badgeCount: myQueriesTotal },
    { name: 'Submit a Query', to: '/queries/new', icon: MessageSquarePlus },
    { name: 'My Activity', to: '/app/activity', icon: Activity },
    { name: 'Reading History', to: '/app/history', icon: History },
    { name: 'Saved Answers', to: '/app/bookmarks', icon: Bookmark },
    { name: 'Collections', to: '/app/collections', icon: Folder },
    { name: 'Achievements', to: '/app/achievements', icon: Award },
    { name: 'Learning Progress', to: '/app/learning', icon: GraduationCap },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-background">
      
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/50 hidden md:block">
        <nav className="flex h-full flex-col p-4 space-y-1">
          {navItems.map((item) => {
            if (item.name === 'Learning Progress') {
              return (
                <a
                  key={item.name}
                  href="https://vibe.vicharanashala.ai/auth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </a>
              );
            }
            const badge = (item as any).badgeCount as number | undefined;
            const isNew = item.name === 'Submit a Query';
            return (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : isNew
                        ? 'text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-900/30'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
                  )
                }
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </span>
                {badge !== undefined && badge > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[1.25rem] px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-600 text-white">
                    {badge}
                  </span>
                )}
                {isNew && badge === undefined && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-600 dark:text-primary-400">
                    <Send className="h-3 w-3" />
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="flex-1" />
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <NavLink
              to="/app/settings"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
                )
              }
            >
              <Settings className="h-5 w-5 shrink-0" />
              Workspace Settings
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header (Mobile + Actions) */}
        <header className="flex h-16 shrink-0 items-center justify-end gap-3 sm:gap-4 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 md:px-8">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <NavLink 
            to="/" 
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Back to Home"
          >
            <Home className="h-5 w-5" />
          </NavLink>

          <NotificationBell />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              title="User menu"
            >
              <UserCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || user?.fullName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    {isAdmin && (
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>Admin Dashboard</Link>
                    )}
                    <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>Home Page</Link>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>Edit Profile</Link>
                    <Link to="/app/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>Workspace Settings</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>Sign In</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>

      </div>
    </div>
  );
};

