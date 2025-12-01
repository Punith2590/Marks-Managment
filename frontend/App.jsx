import React from 'react';
import { useAuth } from './Components/auth/AuthContext';
import LoginPage from './Components/pages/LoginPage';
import SuperAdminDashboard from './Components/SuperAdmin/SuperAdminDashboard';
import AdminDashboard from './Components/Admin/AdminDashboard';
import FacultyLayout from './Components/Faculty/FacultyLayout';

const App = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  switch (user.role) {
    case 'superadmin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'faculty':
      return <FacultyLayout />;
    default:
      // Fallback to login page if role is unknown
      return <LoginPage />;
  }
};

export default App;