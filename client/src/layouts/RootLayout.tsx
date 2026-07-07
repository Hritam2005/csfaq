import React from 'react';
import { Outlet } from 'react-router-dom';
import { CommandPalette } from '../components/ui/CommandPalette';

export const RootLayout: React.FC = () => {
  return (
    <>
      <CommandPalette />
      <Outlet />
    </>
  );
};
