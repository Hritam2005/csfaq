import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Home, LayoutDashboard, UserCircle, LogOut, Sun, Moon, HelpCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setTheme } from '../../store/slices/themeSlice';
import { logout } from '../../store/slices/authSlice';
import { AuthService } from '../../services/AuthService';

type ActionItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  onSelect: () => void;
  keywords?: string[];
};

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme);
  
  // Custom event listener for navbar button trigger
  useEffect(() => {
    const handleOpenCommandPalette = () => setIsOpen(true);
    window.addEventListener('open-command-palette', handleOpenCommandPalette);
    return () => window.removeEventListener('open-command-palette', handleOpenCommandPalette);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      console.error(e);
    }
    dispatch(logout());
    navigate('/');
  };

  const toggleTheme = () => {
    dispatch(setTheme(mode === 'dark' ? 'light' : 'dark'));
  };

  const isAdmin = user?.role?.toString().toLowerCase().includes('admin');

  // Define commands
  const allActions: ActionItem[] = [
    { id: 'home', title: 'Home', icon: <Home className="w-4 h-4" />, onSelect: () => navigate('/'), keywords: ['landing', 'main'] },
    { id: 'faqs', title: 'Search FAQs', icon: <Search className="w-4 h-4" />, onSelect: () => navigate('/faqs'), keywords: ['help', 'questions'] },
    { id: 'theme', title: `Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`, icon: mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, onSelect: toggleTheme, keywords: ['dark', 'light', 'theme', 'color'] },
  ];

  if (isAuthenticated) {
    allActions.push(
      { id: 'dashboard', title: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, onSelect: () => navigate(isAdmin ? '/admin/dashboard' : '/dashboard'), keywords: ['panel', 'home'] },
      { id: 'profile', title: 'Profile Settings', icon: <UserCircle className="w-4 h-4" />, onSelect: () => navigate('/profile'), keywords: ['account', 'user', 'settings'] },
      { id: 'support', title: 'Support / Tickets', icon: <HelpCircle className="w-4 h-4" />, onSelect: () => navigate('/support'), keywords: ['help', 'ticket', 'triage'] },
      { id: 'logout', title: 'Sign Out', icon: <LogOut className="w-4 h-4" />, onSelect: handleLogout, keywords: ['logout', 'exit', 'leave'] }
    );
  } else {
    allActions.push(
      { id: 'login', title: 'Sign In', icon: <UserCircle className="w-4 h-4" />, onSelect: () => navigate('/login'), keywords: ['login', 'authenticate'] },
      { id: 'register', title: 'Create Account', icon: <UserCircle className="w-4 h-4" />, onSelect: () => navigate('/register'), keywords: ['signup', 'register'] }
    );
  }

  // Filter actions based on query
  const filteredActions = allActions.filter(action => {
    if (!query) return true;
    const searchLower = query.toLowerCase();
    return (
      action.title.toLowerCase().includes(searchLower) ||
      action.keywords?.some(k => k.toLowerCase().includes(searchLower))
    );
  });

  // Handle keyboard nav inside modal
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].onSelect();
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  // scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10"
          >
            <div className="flex items-center border-b border-gray-100 px-4 dark:border-gray-800">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleModalKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 h-14 w-full bg-transparent px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white"
              />
              <div className="text-xs text-gray-400 flex gap-1 font-mono">
                <kbd className="rounded border border-gray-200 px-1 dark:border-gray-700">esc</kbd> to close
              </div>
            </div>

            <div 
              ref={listRef}
              className="max-h-[60vh] overflow-y-auto p-2"
            >
              {filteredActions.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No results found.
                </div>
              ) : (
                filteredActions.map((action, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={action.id}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                        isSelected 
                          ? 'bg-primary-50 text-primary-900 dark:bg-primary-900/20 dark:text-primary-100' 
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50'
                      }`}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => {
                        action.onSelect();
                        setIsOpen(false);
                      }}
                    >
                      <div className={`flex items-center justify-center rounded-md p-1 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                        {action.icon}
                      </div>
                      <span className="flex-1 text-left">{action.title}</span>
                      {isSelected && (
                        <span className="text-xs text-gray-400">Enter</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
