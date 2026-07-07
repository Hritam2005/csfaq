import React from 'react';
import { ReduxProvider } from './ReduxProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';

import { SocketProvider } from '../components/providers/SocketProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ENV } from '../config/env';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <GoogleOAuthProvider clientId={ENV.GOOGLE_CLIENT_ID}>
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
    </GoogleOAuthProvider>
  );
};
