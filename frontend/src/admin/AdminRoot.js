import React from 'react';
import { AdminAuthProvider } from './context/AdminAuthContext';

const AdminRoot = ({ children }) => {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
};

export default AdminRoot;
