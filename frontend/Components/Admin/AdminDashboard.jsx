import React, { useState } from 'react';
import MainLayout from '../shared/MainLayout';
import { useAuth } from '../auth/AuthContext';
import { Icons } from '../shared/icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/Card';
import { departments, users as mockUsers, courses as mockCourses, pos as mockPos, psos as mockPsos } from '../data/mockData';
import ConsolidatedMatrixPage from './ConsolidatedMatrixPage';
import ProgramLevelMatrixPage from './ProgramLevelMatrixPage';
import EvaluationResultPage from './EvaluationResultPage';
import IndirectAttainmentPage from './IndirectAttainmentPage';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { id: 'faculty', label: 'Manage Faculty', icon: Icons.Users },
  { id: 'courses', label: 'Assign Courses', icon: Icons.Course },
  { id: 'outcomes', label: 'Manage Outcomes', icon: Icons.Target },
  { id: 'consolidation', label: 'Consolidation of CO-PO/PSO', icon: Icons.ArticulationMatrix },
  { id: 'program-matrix', label: 'Consolidated Matrix', icon: Icons.ArticulationMatrix },
  { id: 'evaluation-result', label: 'Result of Evaluation', icon: Icons.Reports },
  { id: 'indirect-attainment', label: 'Indirect Attainment', icon: Icons.Syllabus },
];

const ConfirmationModal = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Deletion</h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Are you sure you want to delete this outcome? This action may affect existing course articulation matrices and cannot be undone.
                    </p>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdminDashboard = () => {
    const { user } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [pos, setPos] = useState(mockPos);
    const [psos, setPsos] = useState(mockPsos);
    
    const department = departments.find(d => d.id === user?.departmentId);
    const faculty = mockUsers.filter(u => u.role === 'faculty' && u.departmentId === user?.departmentId);
    const courses = mockCourses; // In a real app, filter by department

    const renderContent = () => {
        switch (activePage) {
            case 'faculty':
                return <FacultyManagement faculty={faculty} />;
            case 'courses':
                return <CourseAssignment courses={courses} faculty={faculty} />;
            case 'outcomes':
                return <OutcomesManagement pos={pos} setPos={setPos} psos={psos} setPsos={setPsos} />;
            case 'consolidation':
                return <ConsolidatedMatrixPage />;
            case 'program-matrix':
                return <ProgramLevelMatrixPage />;
            case 'evaluation-result':
                return <EvaluationResultPage />;
            case 'indirect-attainment':
                return <IndirectAttainmentPage />;
            default:
                return <DashboardOverview departmentName={department?.name} facultyCount={faculty.length} />;
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


const DashboardOverview = ({ departmentName, facultyCount }) => (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{departmentName}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Total Faculty</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{facultyCount}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Total Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{mockCourses.length}</p>
                </CardContent>
            </Card>
        </div>
    </div>
);

const FacultyManagement = ({ faculty }) => (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Manage Faculty</CardTitle>
                    <CardDescription>Add, edit, or remove faculty members from your department.</CardDescription>
                </div>
                 <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">Add Faculty</button>
            </div>
        </CardHeader>
        <CardContent>
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {faculty.map(f => (
                        <tr key={f.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{f.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{f.email}</td>
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

const CourseAssignment = ({ courses, faculty }) => {
    const [assignments, setAssignments] = useState(() => {
        const initial = {};
        courses.forEach(c => {
            if (c.assignedFacultyId) {
                initial[c.id] = c.assignedFacultyId;
            }
        });
        return initial;
    });

    const handleAssignmentChange = (courseId, facultyId) => {
        setAssignments(prev => ({ ...prev, [courseId]: facultyId }));
    };

    return (
     <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Assign Courses</CardTitle>
                    <CardDescription>Assign courses to faculty members for the upcoming semester.</CardDescription>
                </div>
                 <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">Save Changes</button>
            </div>
        </CardHeader>
        <CardContent>
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Course Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Course Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Assigned Faculty</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {courses.map(course => (
                        <tr key={course.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">{course.code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{course.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                               <select 
                                 value={assignments[course.id] || ''} 
                                 onChange={(e) => handleAssignmentChange(course.id, e.target.value)}
                                 className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                               >
                                    <option value="">Unassigned</option>
                                    {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </CardContent>
    </Card>
    );
};

const OutcomesManagement = ({ pos, setPos, psos, setPsos }) => {
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        outcomeId: null,
        type: null,
    });
    
    const handleAddPo = () => {
        const newPoId = `PO${pos.length + 1}`;
        setPos([...pos, { id: newPoId, description: 'New Program Outcome' }]);
    };
    
    const handleAddPso = () => {
        const newPsoId = `PSO${psos.length + 1}`;
        setPsos([...psos, { id: newPsoId, description: 'New Program Specific Outcome' }]);
    };

    const handleDeletePo = (id) => {
        setPos(pos.filter(p => p.id !== id));
    };

    const handleDeletePso = (id) => {
        setPsos(psos.filter(p => p.id !== id));
    };
    
    const handleDescriptionChange = (id, newDescription, type) => {
        if (type === 'po') {
            setPos(pos.map(p => p.id === id ? { ...p, description: newDescription } : p));
        } else {
            setPsos(psos.map(p => p.id === id ? { ...p, description: newDescription } : p));
        }
    };

    const requestDeleteOutcome = (outcomeId, type) => {
        setDeleteConfirmation({ isOpen: true, outcomeId, type });
    };

    const cancelDeleteOutcome = () => {
        setDeleteConfirmation({ isOpen: false, outcomeId: null, type: null });
    };

    const confirmDeleteOutcome = () => {
        const { outcomeId, type } = deleteConfirmation;
        if (!outcomeId || !type) return;

        if (type === 'po') {
            handleDeletePo(outcomeId);
        } else {
            handleDeletePso(outcomeId);
        }
        
        cancelDeleteOutcome();
    };
    
    return (
        <div className="space-y-6">
            {deleteConfirmation.isOpen && <ConfirmationModal onConfirm={confirmDeleteOutcome} onCancel={cancelDeleteOutcome} />}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Manage Program Outcomes (POs)</CardTitle>
                            <CardDescription>Define the POs for the department.</CardDescription>
                        </div>
                        <button onClick={handleAddPo} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                           <Icons.PlusCircle className="h-4 w-4" /> Add PO
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-24">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {pos.map(po => (
                                <tr key={po.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{po.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        <input 
                                            type="text"
                                            value={po.description}
                                            onChange={(e) => handleDescriptionChange(po.id, e.target.value, 'po')}
                                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => requestDeleteOutcome(po.id, 'po')} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                            <Icons.Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Manage Program Specific Outcomes (PSOs)</CardTitle>
                            <CardDescription>Define the PSOs for the department.</CardDescription>
                        </div>
                        <button onClick={handleAddPso} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                           <Icons.PlusCircle className="h-4 w-4" /> Add PSO
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                     <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-24">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {psos.map(pso => (
                                // FIX: Duplicate key prop warning. Using pso.id for the key prop on the <tr> element.
                                <tr key={pso.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{pso.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                         <input 
                                            type="text"
                                            value={pso.description}
                                            onChange={(e) => handleDescriptionChange(pso.id, e.target.value, 'pso')}
                                            className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => requestDeleteOutcome(pso.id, 'pso')} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                            <Icons.Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;