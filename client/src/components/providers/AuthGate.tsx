import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setInitialized, setUser } from '../../store/slices/authSlice';
import { PageLoader } from './PageLoader';
import { AuthService } from '../../services/AuthService';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isInitializing, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated) {
        try {
          const profile = await AuthService.getProfile();
          dispatch(setUser(profile.data));
        } catch (error) {
          console.error('Failed to reload profile on startup:', error);
        }
      }
      dispatch(setInitialized());
    };

    initAuth();
  }, [dispatch, isAuthenticated]);

  if (isInitializing) {
    return <PageLoader />;
  }

  return <>{children}</>;
};
