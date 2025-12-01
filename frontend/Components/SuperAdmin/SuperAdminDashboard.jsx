import React, { useState } from 'react';
import MainLayout from '../shared/MainLayout'; // Updated path
import { useAuth } from '../auth/AuthContext'; // Updated path
import { Icons } from '../shared/icons'; // Updated path
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/Card'; // Updated path
import { departments as mockDepartments, users as mockUsers } from '../data/mockData'; // Updated path
import DepartmentAttainmentPage from './DepartmentAttainmentPage'; // Updated path

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { id: 'departments', label: 'Departments', icon: Icons.Department },
  { id: 'admins', label: 'Admins', icon: Icons.Admin },
  { id: 'attainment', label: 'Department Attainment', icon: Icons.Reports },
];

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [departments, setDepartments] = useState(mockDepartments);
    const [admins, setAdmins] = useState(mockUsers.filter(u => u.role === 'admin'));

    const renderContent = () => {
        switch (activePage) {
            case 'departments':
                return <DepartmentManagement departments={departments} />;
            case 'admins':
                return <AdminManagement admins={admins} departments={departments} />;
            case 'attainment':
                return <DepartmentAttainmentPage />;
            default:
                return <DashboardOverview />;
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
            {renderContent()}
        </MainLayout>
    );
};

const DashboardOverview = () => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Super Admin Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome! Manage departments and administrators across the institution.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Total Departments</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{mockDepartments.length}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Total Admins</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{mockUsers.filter(u=>u.role === 'admin').length}</p>
                </CardContent>
            </Card>
        </div>
    </div>
);

const DepartmentManagement = ({ departments }) => (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Manage Departments</CardTitle>
                    <CardDescription>Add, edit, or remove academic departments.</CardDescription>
                </div>
                 <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">Add Department</button>
            </div>
        </CardHeader>
        <CardContent>
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Department Name</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {departments.map(dept => (
                        <tr key={dept.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{dept.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">Edit</a>
                                <a href="#" className="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Delete</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </CardContent>
    </Card>
);

const AdminManagement = ({ admins, departments }) => (
     <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Manage Admins</CardTitle>
                    <CardDescription>Assign departmental admins and manage their access.</CardDescription>
                </div>
                 <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">Add Admin</button>
            </div>
        </CardHeader>
        <CardContent>
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Department</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {admins.map(admin => (
                        <tr key={admin.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{admin.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{admin.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{departments.find(d => d.id === admin.departmentId)?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">Edit</a>
                                <a href="#" className="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Delete</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </CardContent>
    </Card>
);


export default SuperAdminDashboard;