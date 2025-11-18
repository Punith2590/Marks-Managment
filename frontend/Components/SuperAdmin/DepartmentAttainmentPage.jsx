import React, { useState, useMemo } from 'react';
import { courses, pos, psos, articulationMatrix, departments as mockDepartments } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/Card';

const DepartmentAttainmentPage = () => {
    // In a real app, departments would be a prop. Here we get them from mockData.
    const departments = mockDepartments;
    const [selectedDepartmentId, setSelectedDepartmentId] = useState(departments[0]?.id ?? '');

    // This useMemo block contains all the calculation logic, refactored from EvaluationResultPage.
    // It will re-run whenever the selected department changes.
    const attainmentData = useMemo(() => {
        // NOTE: In a real application, you would filter the following data sources
        // by `selectedDepartmentId`. For this demonstration, we use the global
        // mock data for every department to show the feature's functionality.
        const coursesForDept = courses;
        const posForDept = pos;
        const psosForDept = psos;
        
        const allOutcomes = [...posForDept, ...psosForDept];

        const calculateAverages = (course) => {
            const courseMatrix = articulationMatrix[course.id];
            if (!courseMatrix) return {};

            const averages = {};
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
                    averages[outcome.id] = sum / count;
                }
            });
            return averages;
        };

        const courseAverages = coursesForDept.map(course => ({
            course,
            averages: calculateAverages(course),
        })).sort((a, b) => a.course.semester - b.course.semester || a.course.code.localeCompare(b.course.code));

        const averageData = {};
        allOutcomes.forEach(outcome => {
            let sum = 0;
            let count = 0;
            courseAverages.forEach(ca => {
                if (ca.averages[outcome.id]) {
                    sum += ca.averages[outcome.id];
                    count++;
                }
            });
            if (count > 0) {
                averageData[outcome.id] = sum / count;
            }
        });

        const surveyValue = 3.00; // This would also likely be department-specific
        const indirectAttainment = {};
        allOutcomes.forEach(outcome => {
            indirectAttainment[outcome.id] = surveyValue;
        });

        const cRow = {};
        const dRow = {};
        const totalAttainment = {};
        const percentage = {};

        allOutcomes.forEach(outcome => {
            const a = averageData[outcome.id] || 0;
            const b = indirectAttainment[outcome.id] || 0;
            const c = a * 0.8;
            const d = b * 0.2;
            const total = c + d;
            
            cRow[outcome.id] = c;
            dRow[outcome.id] = d;
            totalAttainment[outcome.id] = total;
            percentage[outcome.id] = (total / 3) * 100;
        });
        
        const summaryRows = [
            { label: 'Average', data: averageData, bold: true },
            { label: 'Direct Attainment [A]', data: averageData, bold: true, bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { label: 'Program Exit Survey', data: Object.fromEntries(allOutcomes.map(o => [o.id, surveyValue])) },
            { label: 'Employer Survey', data: Object.fromEntries(allOutcomes.map(o => [o.id, surveyValue])) },
            { label: 'Alumni Survey', data: Object.fromEntries(allOutcomes.map(o => [o.id, surveyValue])) },
            { label: 'Indirect Attainment [B]', data: indirectAttainment, bold: true, bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { label: 'C=A*0.8', data: cRow },
            { label: 'D=B*0.2', data: dRow },
            { label: 'Total attainment [C+D]', data: totalAttainment, bold: true, bgColor: 'bg-green-50 dark:bg-green-900/20' },
            { label: '%', data: percentage, bold: true, isPercentage: true, bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
        ];

        return { allOutcomes, courseAverages, summaryRows };
    }, [selectedDepartmentId]);

    const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Department Attainment Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
                View the consolidated "Result of Evaluation" for each academic department.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Select Department</CardTitle>
                    <CardDescription>Choose a department to view its attainment report.</CardDescription>
                </CardHeader>
                <CardContent>
                    <select
                        value={selectedDepartmentId}
                        onChange={(e) => setSelectedDepartmentId(e.target.value)}
                        className="block w-full sm:w-96 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        aria-label="Select a department"
                    >
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            {selectedDepartment && attainmentData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Result of Evaluation for {selectedDepartment.name}</CardTitle>
                        <CardDescription>Consolidated table of PO/PSO attainment combining direct and indirect assessments.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                         <div className="overflow-x-auto border dark:border-gray-600 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                                            COURSE
                                        </th>
                                        {attainmentData.allOutcomes.map(outcome => (
                                            <th key={outcome.id} scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                                                <b>{outcome.id}</b>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {attainmentData.courseAverages.map(({ course, averages }) => (
                                        <tr key={course.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                                                {course.code}
                                            </td>
                                            {attainmentData.allOutcomes.map(outcome => {
                                                const avg = averages[outcome.id];
                                                const displayValue = avg ? avg.toFixed(2) : '-';
                                                return (
                                                    <td key={`${course.id}-${outcome.id}`} className="px-3 py-4 whitespace-nowrap text-center text-sm border-r border-gray-200 dark:border-gray-600">
                                                        <span className={avg ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                                                            {displayValue}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    {attainmentData.summaryRows.map(row => (
                                        <tr key={row.label} className={row.bgColor}>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm ${row.bold ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600`}>
                                                {row.label}
                                            </td>
                                            {attainmentData.allOutcomes.map(outcome => {
                                                const value = row.data[outcome.id];
                                                const displayValue = typeof value === 'number' ? value.toFixed(2) : '-';
                                                return (
                                                    <td key={`${row.label}-${outcome.id}`} className={`px-3 py-3 whitespace-nowrap text-center text-sm ${row.bold ? 'font-bold' : ''} border-r border-gray-200 dark:border-gray-600`}>
                                                        <span className={value || value === 0 ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                                                            {displayValue}{row.isPercentage ? '%' : ''}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DepartmentAttainmentPage;