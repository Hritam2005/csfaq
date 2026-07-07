import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, UserCircle, Inbox, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/Button';
import { NotificationBell } from '../ui/NotificationBell';
import { RootState } from '../../store/store';
import { setTheme } from '../../store/slices/themeSlice';
import { logout } from '../../store/slices/authSlice';
import { AuthService } from '../../services/AuthService';
import { ENV } from '../../config/env';
import { useQuery } from '@tanstack/react-query';
import { TriageService } from '../../services/triage/TriageService';

export const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    dispatch(setTheme(mode === 'dark' ? 'light' : 'dark'));
  };

  // Role detection drives which triage link we show in the navbar.
  // `User.role` is a single string per the auth slice type.
  const userRole = (user?.role ?? '').toString();
  const isAdmin =
    userRole.toLowerCase().includes('admin') || userRole === 'Super Admin';

  // Live awaiting count for the admin "Triage Queue" badge.
  const { data: capacity } = useQuery({
    queryKey: ['triage-capacity-nav'],
    queryFn: TriageService.getCapacity,
    enabled: !!isAuthenticated && isAdmin,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  });
  const awaitingBadge = capacity?.activeCases ?? 0;

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

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo & Primary Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Vicharanashala
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Home</Link>
            <Link to="/faqs" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">FAQs</Link>

            {/* Role-aware triage entry point.
                - Admins see a "Triage Queue" link with a live awaiting-count badge.
                - Normal users see a "Submit a Query" link. */}
            {isAuthenticated && isAdmin && (
              <Link
                to="/admin/triage/inbox"
                className="relative inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
              >
                <Inbox className="h-4 w-4" />
                Triage Queue
                {awaitingBadge > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-600 text-white">
                    {awaitingBadge}
                  </span>
                )}
              </Link>
            )}

            <Link to="/support" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Support (Unknown Questions)</Link>
            <a href="https://samagama.in" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Samagama</a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
            className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 px-3 py-1.5 rounded-md transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline-block">Search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:text-gray-400">
              <span className="text-xs">Ctrl</span> K
            </kbd>
          </button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated && <NotificationBell />}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title={user?.name ? `Account: ${user.name}` : 'Account'}
              className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors overflow-hidden"
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? user.avatar : `${ENV.API_URL}/${user.avatar}`}
                  alt="User Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    {isAdmin ? (
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>Admin Dashboard</Link>
                    ) : (
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>User Dashboard</Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>Edit Profile</Link>
                    <a 
                      href="https://docs.google.com/document/d/1xVqTgKfqP-EWnPvowyw2ME9d-3b_VMbBqx9p8lDQXLc/edit?tab=t.0" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" 
                      onClick={() => setDropdownOpen(false)}
                    >
                      Rosetta Journal
                    </a>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>Sign In</Link>
                    <Link to="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>Sign Up</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};