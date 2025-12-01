import React, { useState } from 'react';
import MainLayout from '../shared/MainLayout';
import { useAuth } from '../auth/AuthContext';
import { Icons } from '../shared/icons';
import Dashboard from './Dashboard';
import ArticulationMatrixPage from './ArticulationMatrixPage';
import MarksEntryPage from './MarksEntryPage';
import AttainmentReportPage from './AttainmentReportPage';
import CoPoAttainmentPage from './CoPoAttainmentPage';
import IndirectCoAttainmentPage from './IndirectCoAttainmentPage';
import FacultyConfigurationPage from './FacultyConfigurationPage'; // Import the new page

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { id: 'matrix', label: 'Articulation Matrix', icon: Icons.ArticulationMatrix },
  { id: 'marks', label: 'Marks Entry', icon: Icons.MarksEntry },
  { id: 'indirect-co', label: 'Indirect CO Attainment', icon: Icons.Syllabus },
  { id: 'attainment', label: 'CO-PO Attainment', icon: Icons.Target },
  { id: 'reports', label: 'Attainment Reports', icon: Icons.Reports },
  { id: 'configuration', label: 'Course Settings', icon: Icons.Settings }, // Add Navigation Item
];

const FacultyLayout = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'matrix':
        return <ArticulationMatrixPage />;
      case 'marks':
        return <MarksEntryPage />;
      case 'reports':
        return <AttainmentReportPage />;
      case 'attainment':
        return <CoPoAttainmentPage />;
      case 'indirect-co':
        return <IndirectCoAttainmentPage />;
      case 'configuration': // Add Case
        return <FacultyConfigurationPage />;
      default:
        return <Dashboard />;
    }
  };
  
  if (!user) return null;

  return (
    <MainLayout
      user={user}
      navItems={navItems}
      activePageId={activePage}
      onNavItemClick={(id) => setActivePage(id)}
    >
      {renderPage()}
    </MainLayout>
  );
};

export default FacultyLayout;