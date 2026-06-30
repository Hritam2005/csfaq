import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, Shield, MonitorSmartphone, Settings } from 'lucide-react';
import { cn } from '../components/ui/Button';

export const ProfileLayout: React.FC = () => {
  const navItems = [
    { name: 'Overview', to: '/profile', icon: User, exact: true },
    { name: 'Security', to: '/profile/security', icon: Shield, exact: false },
    { name: 'Sessions', to: '/profile/sessions', icon: MonitorSmartphone, exact: false },
    { name: 'Preferences', to: '/profile/preferences', icon: Settings, exact: false },
  ];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Manage your profile, security, and preferences.</p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Nav */}
        <nav className="flex w-full flex-col gap-1 md:w-64 shrink-0">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
