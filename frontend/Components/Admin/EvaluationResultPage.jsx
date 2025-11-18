import React from 'react';
import { courses, pos, psos, articulationMatrix } from '../data/mockData';
import { Card, CardContent } from '../shared/Card';

const EvaluationResultPage = () => {
    const allOutcomes = [...pos, ...psos];

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

    const courseAverages = courses.map(course => ({
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

    const surveyValue = 3.00;
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


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Result of Evaluation</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
                A consolidated table of PO/PSO attainment combining direct and indirect assessments.
            </p>

            <Card>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto border dark:border-gray-600 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                                        COURSE
                                    </th>
                                    {allOutcomes.map(outcome => (
                                        <th key={outcome.id} scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                                            <b>{outcome.id}</b>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {courseAverages.map(({ course, averages }) => (
                                    <tr key={course.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                                            {course.code}
                                        </td>
                                        {allOutcomes.map(outcome => {
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
                                {summaryRows.map(row => (
                                    <tr key={row.label} className={row.bgColor}>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${row.bold ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600`}>
                                            {row.label}
                                        </td>
                                        {allOutcomes.map(outcome => {
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
        </div>
    );
};

export default EvaluationResultPage;