import React, { useState } from 'react';
import { courses, pos, psos, articulationMatrix } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/Card';

const ConsolidatedMatrixPage = () => {
    const allOutcomes = [...pos, ...psos];
    const [selectedSemester, setSelectedSemester] = useState('all');

    const semesters = [...new Set(courses.map(c => c.semester))].sort((a, b) => a - b);

    const filteredCourses = selectedSemester === 'all'
        ? courses
        : courses.filter(course => course.semester.toString() === selectedSemester);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Consolidation of CO-PO & CO-PSO</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Review the detailed CO-level articulation for each course in the department.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <select
                        id="semester-filter"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="block w-full sm:w-56 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        aria-label="Filter by semester"
                    >
                        <option value="all">All Semesters</option>
                        {semesters.map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredCourses.map(course => {
                const courseMatrix = articulationMatrix[course.id];
                if (!courseMatrix) return null;

                const outcomeAverages = {};
                allOutcomes.forEach(outcome => {
                    let sum = 0;
                    let count = 0;
                    course.cos.forEach(co => {
                        const value = courseMatrix[co.id]?.[outcome.id];
                        if (value && value > 0) {
                            sum += value;
                            count++;
                        }
                    });
                    if (count > 0) {
                        outcomeAverages[outcome.id] = sum / count;
                    }
                });

                return (
                    <Card key={course.id}>
                        <CardHeader>
                            <CardTitle>{course.code} - {course.name}</CardTitle>
                            <CardDescription>Actual Articulation Matrix (Semester {course.semester})</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-600">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="sticky left-0 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r dark:border-gray-600">
                                                COs
                                            </th>
                                            {allOutcomes.map(outcome => (
                                                <th key={outcome.id} scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {outcome.id}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {course.cos.map(co => (
                                            <tr key={co.id}>
                                                <td className="sticky left-0 bg-white dark:bg-gray-800 px-4 py-4 text-sm font-medium text-gray-900 dark:text-white border-r dark:border-gray-600 w-64">
                                                    <div className="font-bold">{co.id.split('.')[1]}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate" title={co.description}>{co.description}</div>
                                                </td>
                                                {allOutcomes.map(outcome => (
                                                    <td key={outcome.id} className="px-3 py-4 whitespace-nowrap text-center text-sm font-semibold">
                                                        <span className={courseMatrix[co.id]?.[outcome.id] ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                                                          {courseMatrix[co.id]?.[outcome.id] || '-'}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                     <tfoot className="border-t-2 border-gray-300 dark:border-gray-600">
                                        <tr className="bg-red-50 dark:bg-red-900/20">
                                            <td className="sticky left-0 bg-red-50 dark:bg-red-900/20 px-4 py-4 text-sm font-bold text-gray-900 dark:text-white border-r dark:border-gray-600">
                                                AVERAGE
                                            </td>
                                            {allOutcomes.map(outcome => {
                                                const avg = outcomeAverages[outcome.id];
                                                const displayValue = avg ? (avg % 1 === 0 ? avg.toString() : avg.toFixed(1)) : '-';
                                                return (
                                                <td key={`avg-${course.id}-${outcome.id}`} className="px-3 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-800 dark:text-gray-100">
                                                    {displayValue}
                                                </td>
                                                );
                                            })}
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default ConsolidatedMatrixPage;