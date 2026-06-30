import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setInitialized } from '../../store/slices/authSlice';
import { PageLoader } from './PageLoader';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isInitializing } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Attempt silent refresh or local token validation here
    // For now, we mock instant resolution
    setTimeout(() => {
      dispatch(setInitialized());
    }, 500);
  }, [dispatch]);

  if (isInitializing) {
    return <PageLoader />;
  }

  return <>{children}</>;
};
