import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, UserCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/Button';
import { NotificationBell } from '../ui/NotificationBell';
import { RootState } from '../../store/store';
import { setTheme } from '../../store/slices/themeSlice';
import { logout } from '../../store/slices/authSlice';
import { AuthService } from '../../services/AuthService';

export const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Vicharanashala
            </span>
          </Link>
          
          <div className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Home</Link>
            <Link to="/faqs" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Knowledge Base</Link>
            <Link to="/support" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Support (Unknown Questions)</Link>
            <a href="/#timeline" className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">Timeline</a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {isAuthenticated && <NotificationBell />}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              <UserCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    {user?.role === 'Admin' || user?.role === 'Super Admin' ? (
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>Admin Dashboard</Link>
                    ) : (
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>User Dashboard</Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>Edit Profile</Link>
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
