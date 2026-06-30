import React from 'react';
import { ReduxProvider } from './ReduxProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';

import { SocketProvider } from '../components/providers/SocketProvider';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReduxProvider>
      <QueryProvider>
        <ThemeProvider>
          <SocketProvider>
            {children}
            <ToastProvider />
          </SocketProvider>
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
};
