import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setTheme } from '../../store/slices/themeSlice';
import { Moon, Sun, Monitor } from 'lucide-react';

export const PreferencesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
      <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Display Preferences</h3>
      
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
        <div className="grid grid-cols-3 gap-4 max-w-lg">
          
          <button 
            onClick={() => dispatch(setTheme('light'))}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${mode === 'light' ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}
          >
            <Sun className="h-6 w-6" />
            <span className="text-sm font-semibold">Light</span>
          </button>
          
          <button 
            onClick={() => dispatch(setTheme('dark'))}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${mode === 'dark' ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}
          >
            <Moon className="h-6 w-6" />
            <span className="text-sm font-semibold">Dark</span>
          </button>

          <button 
            onClick={() => dispatch(setTheme('system'))}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${mode === 'system' ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}
          >
            <Monitor className="h-6 w-6" />
            <span className="text-sm font-semibold">System</span>
          </button>

        </div>
      </div>
    </div>
  );
};
