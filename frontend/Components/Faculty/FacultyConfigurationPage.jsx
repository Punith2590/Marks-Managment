import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/Card';
import { Icons } from '../shared/icons';
import { courses as mockCourses } from '../data/mockData';
import { useAuth } from '../auth/AuthContext';

const FacultyConfigurationPage = () => {
    const { user } = useAuth();
    
    const assignedCourses = useMemo(() => {
        if (!user) return [];
        return mockCourses.filter(c => c.assignedFacultyId === user.id);
    }, [user]);

    const [selectedCourseId, setSelectedCourseId] = useState(assignedCourses[0]?.id ?? '');
    
    // Config States
    const [targetPercentage, setTargetPercentage] = useState(60); // Default 60% of max marks
    const [assessmentTools, setAssessmentTools] = useState([
        { 
            id: '1', 
            name: 'Internal Assessment 1', 
            maxMarks: 30, 
            coMapped: ['CO1', 'CO2'],
            coDistribution: { 'CO1': 15, 'CO2': 15 }
        },
        { 
            id: '2', 
            name: 'Internal Assessment 2', 
            maxMarks: 30, 
            coMapped: ['CO2', 'CO3'],
            coDistribution: { 'CO2': 15, 'CO3': 15 }
        },
        { 
            id: '3', 
            name: 'Assignment 1', 
            maxMarks: 10, 
            coMapped: ['CO1'],
            coDistribution: { 'CO1': 10 }
        },
    ]);

    useEffect(() => {
        if (assignedCourses.length > 0 && !assignedCourses.some(c => c.id === selectedCourseId)) {
            setSelectedCourseId(assignedCourses[0].id);
        } else if (assignedCourses.length === 0) {
            setSelectedCourseId('');
        }
    }, [assignedCourses, selectedCourseId]);

    const selectedCourse = assignedCourses.find(c => c.id === selectedCourseId);

    const handleAddTool = () => {
        const newId = (assessmentTools.length + 1).toString();
        setAssessmentTools([...assessmentTools, { id: newId, name: 'New Assessment', maxMarks: 10, coMapped: [], coDistribution: {} }]);
    };

    const handleRemoveTool = (id) => {
        setAssessmentTools(assessmentTools.filter(t => t.id !== id));
    };

    const handleToolChange = (id, field, value) => {
        setAssessmentTools(assessmentTools.map(tool => 
            tool.id === id ? { ...tool, [field]: value } : tool
        ));
    };
    
    const handleCoSelection = (toolId, coName, selected) => {
        setAssessmentTools(assessmentTools.map(tool => {
            if (tool.id !== toolId) return tool;
            
            const newMapped = selected 
                ? [...tool.coMapped, coName]
                : tool.coMapped.filter(c => c !== coName);
            
            const newDistribution = { ...tool.coDistribution };
            if (!selected) {
                delete newDistribution[coName];
            } else if (selected && !newDistribution[coName]) {
                newDistribution[coName] = 0;
            }

            return { ...tool, coMapped: newMapped, coDistribution: newDistribution };
        }));
    };

    const handleCoMarksChange = (toolId, coName, marks) => {
         setAssessmentTools(assessmentTools.map(tool => {
            if (tool.id !== toolId) return tool;
            return {
                ...tool,
                coDistribution: {
                    ...tool.coDistribution,
                    [coName]: marks
                }
            };
        }));
    };

    const handleSave = () => {
        alert(`Configuration for ${selectedCourse?.code} saved successfully.`);
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Course Configuration</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Configure assessment tools and target thresholds for your courses.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                     <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="block w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={assignedCourses.length === 0}
                    >
                        {assignedCourses.length > 0 ? assignedCourses.map(course => (
                            <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                        )) : <option>No courses assigned</option>}
                    </select>
                    <button 
                        onClick={handleSave}
                        disabled={!selectedCourse}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:bg-gray-400"
                    >
                        <Icons.Settings className="h-4 w-4" /> Save
                    </button>
                </div>
            </div>

            {selectedCourse ? (
                <>
                {/* Target Setting */}
                <Card>
                    <CardHeader>
                        <CardTitle>Course Target Setting</CardTitle>
                        <CardDescription>Define the minimum score percentage a student must achieve to be considered "Attained" for a specific assessment/CO.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Individual Target Threshold:</label>
                             <div className="relative w-32">
                                <input 
                                    type="number" 
                                    min="0"
                                    max="100"
                                    value={targetPercentage}
                                    onChange={(e) => setTargetPercentage(parseInt(e.target.value))}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 dark:text-gray-400">%</span>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                (e.g., A student must score {targetPercentage}% of max marks to pass a CO)
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Assessment Configuration */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Assessment Tools & CO Mapping</CardTitle>
                                <CardDescription>Define the assessments conducted for this course and map/weight COs.</CardDescription>
                            </div>
                            <button onClick={handleAddTool} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                                <Icons.PlusCircle className="h-4 w-4" /> Add Tool
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase align-top">Assessment Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-32 align-top">Max Marks</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase align-top">CO Mapping & Weightage</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-20 align-top">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {assessmentTools.map((tool) => {
                                        const currentDistributionSum = Object.values(tool.coDistribution).reduce((a, b) => a + b, 0);
                                        const isSumMismatch = currentDistributionSum !== tool.maxMarks;
                                        
                                        return (
                                        <tr key={tool.id}>
                                            <td className="px-6 py-4 align-top">
                                                <input 
                                                    type="text" 
                                                    value={tool.name}
                                                    onChange={(e) => handleToolChange(tool.id, 'name', e.target.value)}
                                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 text-sm dark:text-white"
                                                    placeholder="e.g. Quiz 1"
                                                />
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                 <input 
                                                    type="number" 
                                                    value={tool.maxMarks}
                                                    onChange={(e) => handleToolChange(tool.id, 'maxMarks', parseInt(e.target.value))}
                                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500 text-sm dark:text-white"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    {selectedCourse.cos.map(co => {
                                                        const coIdShort = co.id.split('.')[1];
                                                        const isChecked = tool.coMapped.includes(coIdShort);
                                                        return (
                                                            <div key={co.id} className="flex items-center gap-3">
                                                                <label className="inline-flex items-center text-sm w-20 flex-shrink-0">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                                                                        checked={isChecked}
                                                                        onChange={(e) => handleCoSelection(tool.id, coIdShort, e.target.checked)}
                                                                    />
                                                                    <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">{coIdShort}</span>
                                                                </label>
                                                                {isChecked && (
                                                                    <div className="flex items-center gap-2">
                                                                        <input 
                                                                            type="number" 
                                                                            value={tool.coDistribution[coIdShort] || ''}
                                                                            onChange={(e) => handleCoMarksChange(tool.id, coIdShort, parseInt(e.target.value))}
                                                                            placeholder="Marks"
                                                                            className="w-20 h-7 text-xs border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 focus:ring-1 focus:ring-primary-500"
                                                                        />
                                                                        <span className="text-xs text-gray-400">marks</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    
                                                    {tool.coMapped.length > 0 && (
                                                        <div className={`mt-2 text-xs font-semibold flex items-center gap-2 ${isSumMismatch ? 'text-amber-600 dark:text-amber-500' : 'text-green-600 dark:text-green-400'}`}>
                                                            <span>Total Allocated: {currentDistributionSum} / {tool.maxMarks}</span>
                                                            {isSumMismatch && <span className="text-red-500 text-[10px]">(Mismatch)</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right align-top">
                                                <button onClick={() => handleRemoveTool(tool.id)} className="text-red-500 hover:text-red-700">
                                                    <Icons.Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                </>
            ) : (
                 <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p>No courses assigned to configure.</p>
                </div>
            )}
        </div>
    );
};

export default FacultyConfigurationPage;