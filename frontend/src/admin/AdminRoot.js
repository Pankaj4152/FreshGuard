import React from 'react';
import { AdminAuthProvider } from './context/AdminAuthContext';
import EnvironmentIndicator from './components/EnvironmentIndicator';

const AdminRoot = ({ children }) => {
  return (
    <AdminAuthProvider>
      {children}
      <EnvironmentIndicator />
    </AdminAuthProvider>
  );
};

export default AdminRoot;
