import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/Card';
import { Icons } from '../shared/icons';
import { pos as defaultPos, psos as defaultPsos } from '../data/mockData';

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

const AdminConfigurationPage = () => {
    // Configuration State - Filters
    const [scheme, setScheme] = useState('2022 Scheme');
    const [semester, setSemester] = useState('All Semesters');
    
    // Configuration Settings
    const [weightage, setWeightage] = useState({
        direct: 80,
        indirect: 20
    });

    const [thresholds, setThresholds] = useState({
        level3: 80, // % of students
        level2: 70,
        level1: 60
    });

    // Outcomes State
    const [pos, setPos] = useState(defaultPos);
    const [psos, setPsos] = useState(defaultPsos);
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        outcomeId: null,
        type: null,
    });

    // Handlers
    const handleWeightageChange = (type, value) => {
        if (type === 'direct') {
            setWeightage({ direct: value, indirect: 100 - value });
        } else {
            setWeightage({ indirect: value, direct: 100 - value });
        }
    };

    const handleSave = () => {
        alert(`Configuration for ${scheme} - ${semester} saved successfully.`);
    };

    // Outcome Handlers
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
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">System Configuration</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Configure academic settings and outcome definitions.</p>
                </div>
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium self-start sm:self-auto"
                >
                    <Icons.Settings className="h-4 w-4" /> Save Configuration
                </button>
            </div>

            {/* Context Filters */}
            <Card>
                <CardContent className="p-4 sm:p-6">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheme Selection</label>
                            <select 
                                value={scheme} 
                                onChange={(e) => setScheme(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option>2022 Scheme</option>
                                <option>2021 Scheme</option>
                                <option>2018 Scheme</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                             <select 
                                value={semester} 
                                onChange={(e) => setSemester(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="All Semesters">All Semesters</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <option key={sem} value={`Semester ${sem}`}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attainment Weightage */}
                <Card>
                    <CardHeader>
                        <CardTitle>Attainment Weightage Calculation</CardTitle>
                        <CardDescription>Define how final PO attainment is calculated for {scheme}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="font-medium text-gray-700 dark:text-gray-300">Direct Attainment (Exams/Labs)</label>
                                <span className="font-bold text-primary-600">{weightage.direct}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={weightage.direct} 
                                onChange={(e) => handleWeightageChange('direct', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                        </div>
                         <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="font-medium text-gray-700 dark:text-gray-300">Indirect Attainment (Surveys)</label>
                                <span className="font-bold text-primary-600">{weightage.indirect}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={weightage.indirect} 
                                onChange={(e) => handleWeightageChange('indirect', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Attainment Levels */}
                <Card>
                    <CardHeader>
                        <CardTitle>Attainment Level Definitions</CardTitle>
                        <CardDescription>Percentage of students required to achieve specific levels.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Level 3 (High)</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Above</span>
                                <input 
                                    type="number" 
                                    value={thresholds.level3}
                                    onChange={(e) => setThresholds({...thresholds, level3: parseInt(e.target.value)})}
                                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <span className="text-sm font-semibold">%</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Level 2 (Medium)</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Above</span>
                                <input 
                                    type="number" 
                                    value={thresholds.level2}
                                    onChange={(e) => setThresholds({...thresholds, level2: parseInt(e.target.value)})}
                                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <span className="text-sm font-semibold">%</span>
                            </div>
                        </div>
                         <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Level 1 (Low)</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Above</span>
                                <input 
                                    type="number" 
                                    value={thresholds.level1}
                                    onChange={(e) => setThresholds({...thresholds, level1: parseInt(e.target.value)})}
                                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <span className="text-sm font-semibold">%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Manage Outcomes Section - Full Width */}
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-8">Outcome Definitions ({scheme})</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Program Outcomes (POs)</CardTitle>
                                <CardDescription>Define the POs for the department.</CardDescription>
                            </div>
                            <button onClick={handleAddPo} className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-xs font-medium">
                               <Icons.PlusCircle className="h-4 w-4" /> Add PO
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-20">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {pos.map(po => (
                                        <tr key={po.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white align-top">{po.id}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                                                <textarea 
                                                    value={po.description}
                                                    onChange={(e) => handleDescriptionChange(po.id, e.target.value, 'po')}
                                                    rows={2}
                                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 resize-none text-sm dark:text-white"
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium align-top">
                                                <button onClick={() => requestDeleteOutcome(po.id, 'po')} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                    <Icons.Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Program Specific Outcomes (PSOs)</CardTitle>
                                <CardDescription>Define the PSOs for the department.</CardDescription>
                            </div>
                            <button onClick={handleAddPso} className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-xs font-medium">
                               <Icons.PlusCircle className="h-4 w-4" /> Add PSO
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-20">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {psos.map(pso => (
                                        <tr key={pso.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white align-top">{pso.id}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                                                 <textarea 
                                                    value={pso.description}
                                                    onChange={(e) => handleDescriptionChange(pso.id, e.target.value, 'pso')}
                                                    rows={2}
                                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 resize-none text-sm dark:text-white"
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium align-top">
                                                <button onClick={() => requestDeleteOutcome(pso.id, 'pso')} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                    <Icons.Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminConfigurationPage;