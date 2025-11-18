import React, { useState, useMemo, useEffect } from 'react';
import { courses as mockCourses, studentsByCourse } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/Card';
import { useAuth } from '../auth/AuthContext';

// --- CONFIGURATION ---
// This detailed configuration mimics the structure from the user's document.
const DETAILED_COURSE_CONFIG = {
    'C001': { // Data Structures and Algorithms
        targetPercentage: 50,
        attainmentLevels: [ // Based on % of students achieving target
            { threshold: 80, level: 3 },
            { threshold: 70, level: 2 },
            { threshold: 60, level: 1 },
            { threshold: 0, level: 0 },
        ],
        cos: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'],
        assessments: {
            ia1: { name: 'IA-1', total: 20, parts: [{ id: '1A', max: 10, co: 'CO1' }, { id: '1B', max: 10, co: 'CO2' }] },
            ia2: { name: 'IA-2', total: 20, parts: [{ id: '1A', max: 10, co: 'CO2' }, { id: '1B', max: 10, co: 'CO3' }] },
            ia3: { name: 'IA-3', total: 20, parts: [{ id: '1A', max: 10, co: 'CO4' }, { id: '1B', max: 10, co: 'CO5' }] },
            otherCie: [
                { id: 'CO1_Quiz', name: 'CO1', max: 10, co: 'CO1' },
                { id: 'CO2_Quiz', name: 'CO2', max: 10, co: 'CO2' },
                { id: 'CO3_Quiz', name: 'CO3', max: 10, co: 'CO3' },
                { id: 'CO4_Quiz', name: 'CO4', max: 10, co: 'CO4' },
                { id: 'CO5_Quiz', name: 'CO5', max: 20, co: 'CO5' },
            ]
        },
        see: {
            name: 'SEE',
            total: 60,
            coMapping: { CO1: 12, CO2: 12, CO3: 12, CO4: 12, CO5: 12 } // How the 60 marks are split
        },
    },
    'C002': { // Database Management Systems - Add similar config if needed
        targetPercentage: 50,
        attainmentLevels: [ { threshold: 80, level: 3 }, { threshold: 70, level: 2 }, { threshold: 60, level: 1 }, { threshold: 0, level: 0 } ],
        cos: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'],
        assessments: {
            ia1: { name: 'IA-1', total: 20, parts: [{ id: '1A', max: 10, co: 'CO1' }, { id: '1B', max: 10, co: 'CO2' }] },
            ia2: { name: 'IA-2', total: 20, parts: [{ id: '1A', max: 10, co: 'CO2' }, { id: '1B', max: 10, co: 'CO3' }] },
            ia3: { name: 'IA-3', total: 20, parts: [{ id: '1A', max: 10, co: 'CO4' }, { id: '1B', max: 10, co: 'CO5' }] },
            otherCie: [
                { id: 'CO1_Quiz', name: 'CO1', max: 10, co: 'CO1' },
                { id: 'CO2_Quiz', name: 'CO2', max: 10, co: 'CO2' },
                { id: 'CO3_Quiz', name: 'CO3', max: 10, co: 'CO3' },
                { id: 'CO4_Quiz', name: 'CO4', max: 10, co: 'CO4' },
                { id: 'CO5_Quiz', name: 'CO5', max: 20, co: 'CO5' },
            ]
        },
        see: { name: 'SEE', total: 60, coMapping: { CO1: 12, CO2: 12, CO3: 12, CO4: 12, CO5: 12 } },
    }
};

// --- MOCK DATA GENERATION ---
const generateDetailedMarks = (students, config) => {
    if (!config) return {};
    const marks = {};
    students.forEach(student => {
        marks[student.id] = { ia1: {}, ia2: {}, ia3: {}, otherCie: {}, see: 0 };
        ['ia1', 'ia2', 'ia3'].forEach(iaKey => {
            config.assessments[iaKey].parts.forEach((part) => {
                marks[student.id][iaKey][part.id] = Math.round(Math.random() * part.max * 0.9 + part.max * 0.1);
            });
        });
        config.assessments.otherCie.forEach((item) => {
             marks[student.id].otherCie[item.id] = Math.round(Math.random() * item.max * 0.9 + item.max * 0.1);
        });
        marks[student.id].see = Math.round(Math.random() * config.see.total * 0.9 + config.see.total * 0.1);
    });
    return marks;
};


const CoPoAttainmentPage = () => {
    const { user } = useAuth();

    const assignedCourses = useMemo(() => {
        if (!user) return [];
        return mockCourses.filter(c => c.assignedFacultyId === user.id && DETAILED_COURSE_CONFIG[c.id]);
    }, [user]);

    const [selectedCourseId, setSelectedCourseId] = useState(assignedCourses[0]?.id ?? '');

    useEffect(() => {
        if (assignedCourses.length > 0 && !assignedCourses.some(c => c.id === selectedCourseId)) {
            setSelectedCourseId(assignedCourses[0].id);
        } else if (assignedCourses.length === 0) {
            setSelectedCourseId('');
        }
    }, [assignedCourses, selectedCourseId]);

    const calculationResults = useMemo(() => {
        if (!selectedCourseId || !DETAILED_COURSE_CONFIG[selectedCourseId]) return null;

        const config = DETAILED_COURSE_CONFIG[selectedCourseId];
        const students = studentsByCourse[selectedCourseId] || [];
        if (students.length === 0) return null;
        
        const marks = generateDetailedMarks(students, config);

        // 1. Calculate Max marks for each CO
        const maxCoMarks = {};
        config.cos.forEach((co) => {
            maxCoMarks[co] = 0;
            ['ia1', 'ia2', 'ia3'].forEach(iaKey => {
                config.assessments[iaKey].parts.forEach((p) => { if (p.co === co) maxCoMarks[co] += p.max });
            });
            config.assessments.otherCie.forEach((item) => { if (item.co === co) maxCoMarks[co] += item.max });
            maxCoMarks[co] += config.see.coMapping[co] || 0;
        });
        
        // 2. Process each student's marks
        const studentData = students.map(student => {
            const studentMarks = marks[student.id];
            const processed = { student, marks: studentMarks, coScores: {} };

            // IAs
            ['ia1', 'ia2', 'ia3'].forEach(iaKey => {
                const iaConfig = config.assessments[iaKey];
                const total = iaConfig.parts.reduce((sum, p) => sum + studentMarks[iaKey][p.id], 0);
                const score = total >= iaConfig.total * (config.targetPercentage / 100) ? 3 : 1; // Simplified score
                processed[iaKey] = {
                    ...studentMarks[iaKey],
                    total,
                    score,
                    passed: total >= iaConfig.total * (config.targetPercentage / 100),
                };
            });

            // SEE
            const seeScore = processed.marks.see >= config.see.total * (config.targetPercentage / 100) ? 3 : 1;
            processed.see = {
                total: processed.marks.see,
                score: seeScore,
                passed: processed.marks.see >= config.see.total * (config.targetPercentage / 100),
            };

            // Per-CO Scores
            config.cos.forEach((co) => {
                let totalStudentCoMarks = 0;
                ['ia1', 'ia2', 'ia3'].forEach(iaKey => {
                    config.assessments[iaKey].parts.forEach((p) => { if (p.co === co) totalStudentCoMarks += processed[iaKey][p.id]; });
                });
                config.assessments.otherCie.forEach((item) => { if (item.co === co) totalStudentCoMarks += studentMarks.otherCie[item.id]; });
                
                // Distribute SEE marks based on CO mapping percentages
                const seeCoMark = studentMarks.see * (config.see.coMapping[co] / config.see.total);
                totalStudentCoMarks += seeCoMark;
                
                processed.coScores[co] = maxCoMarks[co] > 0 ? (totalStudentCoMarks / maxCoMarks[co]) * 3 : 0;
            });

            processed.avgCoScore = config.cos.reduce((sum, co) => sum + processed.coScores[co], 0) / config.cos.length;
            processed.avgCoPassed = processed.avgCoScore >= (3 * config.targetPercentage / 100);

            return processed;
        });
        
        // 3. Calculate Summaries
        const summary = { cos: {} };
        ['ia1', 'ia2', 'ia3', 'see'].forEach(key => {
            summary[key] = {
                passedCount: studentData.filter(s => s[key].passed).length
            };
        });

        config.cos.forEach((co) => {
             const passedCount = studentData.filter(s => s.coScores[co] >= 3 * (config.targetPercentage / 100)).length;
             const percentage = (passedCount / students.length) * 100;
             summary.cos[co] = {
                 passedCount,
                 percentage,
                 attainmentLevel: config.attainmentLevels.find((l) => percentage >= l.threshold)?.level ?? 0,
                 avgScore: studentData.reduce((sum, s) => sum + s.coScores[co], 0) / students.length,
             }
        });

        return { config, students, studentData, summary };

    }, [selectedCourseId]);

    if (!user) return <div className="p-4">Loading user data...</div>;
    if (assignedCourses.length === 0) {
        return <div className="p-4">No courses with attainment configuration are assigned to you.</div>;
    }
    
    const renderHeader = () => {
        if (!calculationResults) return null;
        const { config } = calculationResults;
        const otherCieForIA = {
            ia1: config.assessments.otherCie.filter((c) => ['CO1', 'CO2'].includes(c.co)),
            ia2: config.assessments.otherCie.filter((c) => ['CO3', 'CO4'].includes(c.co)),
            ia3: config.assessments.otherCie.filter((c) => ['CO5'].includes(c.co)),
        };

        return (
            <thead className="bg-gray-100 dark:bg-gray-800 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                <tr>
                    <th rowSpan={2} className="sticky left-0 bg-gray-100 dark:bg-gray-800 px-2 py-2 border-r dark:border-gray-600 z-20 w-12">SL</th>
                    <th rowSpan={2} className="sticky left-12 bg-gray-100 dark:bg-gray-800 px-2 py-2 border-r dark:border-gray-600 z-20 w-32">USN</th>
                    <th rowSpan={2} className="sticky left-44 bg-gray-100 dark:bg-gray-800 px-2 py-2 border-r dark:border-gray-600 z-20 w-48">Name</th>
                    
                    {['ia1', 'ia2', 'ia3'].map(iaKey => (
                         <React.Fragment key={iaKey}>
                            <th colSpan={config.assessments[iaKey].parts.length + 2 + otherCieForIA[iaKey].length}>{config.assessments[iaKey].name} ({config.assessments[iaKey].total})</th>
                         </React.Fragment>
                    ))}

                    <th colSpan={config.cos.length + 2}>CO Attainment</th>
                    <th colSpan={3}>Semester End Exam ({config.see.total})</th>
                </tr>
                <tr>
                    {['ia1', 'ia2', 'ia3'].map(iaKey => (
                         <React.Fragment key={iaKey}>
                            {config.assessments[iaKey].parts.map((p) => <th key={p.id} className="px-2 py-1 border-l dark:border-gray-600 whitespace-nowrap">{p.id} ({p.max})</th>)}
                            <th className="px-2 py-1 border-l dark:border-gray-600 whitespace-nowrap">Total</th>
                            <th className="px-2 py-1 border-l dark:border-gray-600 whitespace-nowrap">Target 50%</th>
                             {otherCieForIA[iaKey].map((c) => <th key={c.id} className="px-2 py-1 border-l dark:border-gray-600 whitespace-nowrap">{c.name} ({c.max})</th>)}
                         </React.Fragment>
                    ))}

                    {config.cos.map((co) => <th key={co} className="px-2 py-1 border-l dark:border-gray-600">{co}</th>)}
                    <th className="px-2 py-1 border-l dark:border-gray-600">Scores</th>
                    <th className="px-2 py-1 border-l dark:border-gray-600">Target 50%</th>

                    <th className="px-2 py-1 border-l dark:border-gray-600">SEE ({config.see.total})</th>
                    <th className="px-2 py-1 border-l dark:border-gray-600">Scores</th>
                    <th className="px-2 py-1 border-l dark:border-gray-600">Target 50%</th>
                </tr>
            </thead>
        );
    };

    const renderBody = () => {
        if (!calculationResults) return <tbody><tr><td colSpan={50} className="text-center p-8">Select a course to generate the report.</td></tr></tbody>;
        const { studentData, config } = calculationResults;
        const otherCieForIA = {
            ia1: config.assessments.otherCie.filter((c) => ['CO1', 'CO2'].includes(c.co)),
            ia2: config.assessments.otherCie.filter((c) => ['CO3', 'CO4'].includes(c.co)),
            ia3: config.assessments.otherCie.filter((c) => ['CO5'].includes(c.co)),
        };

        return (
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 text-center text-sm">
                {studentData.map((data, index) => (
                    <tr key={data.student.id}>
                        <td className="sticky left-0 bg-white dark:bg-gray-900 px-2 py-2 border-r dark:border-gray-600 z-10">{index + 1}</td>
                        <td className="sticky left-12 bg-white dark:bg-gray-900 px-2 py-2 border-r dark:border-gray-600 z-10 font-mono">{data.student.usn}</td>
                        <td className="sticky left-44 bg-white dark:bg-gray-900 px-2 py-2 border-r dark:border-gray-600 z-10 text-left">{data.student.name}</td>
                        
                        {['ia1', 'ia2', 'ia3'].map(iaKey => (
                            <React.Fragment key={iaKey}>
                                {config.assessments[iaKey].parts.map((p) => <td key={p.id} className="px-2 py-2 border-l dark:border-gray-600">{data[iaKey][p.id]}</td>)}
                                <td className="px-2 py-2 border-l dark:border-gray-600 font-bold">{data[iaKey].total}</td>
                                <td className={`px-2 py-2 border-l dark:border-gray-600 font-bold ${data[iaKey].passed ? 'text-green-600' : 'text-red-500'}`}>{data[iaKey].passed ? 'Y' : 'N'}</td>
                                {otherCieForIA[iaKey].map((c) => <td key={c.id} className="px-2 py-2 border-l dark:border-gray-600">{data.marks.otherCie[c.id]}</td>)}
                            </React.Fragment>
                        ))}

                        {config.cos.map((co) => <td key={co} className="px-2 py-2 border-l dark:border-gray-600">{data.coScores[co].toFixed(2)}</td>)}
                        <td className="px-2 py-2 border-l dark:border-gray-600 font-bold">{data.avgCoScore.toFixed(2)}</td>
                        <td className={`px-2 py-2 border-l dark:border-gray-600 font-bold ${data.avgCoPassed ? 'text-green-600' : 'text-red-500'}`}>{data.avgCoPassed ? 'Y' : 'N'}</td>

                        <td className="px-2 py-2 border-l dark:border-gray-600">{data.see.total}</td>
                        <td className="px-2 py-2 border-l dark:border-gray-600">{data.see.score}</td>
                        <td className={`px-2 py-2 border-l dark:border-gray-600 font-bold ${data.see.passed ? 'text-green-600' : 'text-red-500'}`}>{data.see.passed ? 'Y' : 'N'}</td>
                    </tr>
                ))}
            </tbody>
        );
    };

    const renderFooter = () => {
         if (!calculationResults) return null;
         const { summary, config } = calculationResults;
         const renderSummaryCells = (key) => (
            <>
                <td colSpan={config.assessments[key].parts.length}></td>
                <td>{summary[key].passedCount}</td>
                <td></td>
                <td colSpan={config.assessments.otherCie.filter((c) => ['CO1', 'CO2'].includes(c.co) && key==='ia1' || ['CO3', 'CO4'].includes(c.co) && key==='ia2' || ['CO5'].includes(c.co) && key==='ia3' ).length}></td>
            </>
         );
         
         const footerRows = [
            { label: "Number of 'Y's", dataKey: 'passedCount', source: summary.cos, suffix: '' },
            { label: "Score Index & No's", dataKey: 'passedCount', source: summary.cos, suffix: ''}, // Re-using passedCount as per image similarity
            { label: "%", dataKey: 'percentage', source: summary.cos, suffix: '%' },
            { label: "CO ATTAINMENT", dataKey: 'attainmentLevel', source: summary.cos, suffix: '' },
            { label: "CO SCORE", dataKey: 'avgScore', source: summary.cos, suffix: '' },
         ];

        return (
            <tfoot className="bg-blue-50 dark:bg-blue-900/20 font-bold text-sm text-center">
                 <tr>
                    <td colSpan={3} className="px-2 py-2 border-r dark:border-gray-600 text-left">Number of 'Y's</td>
                    {renderSummaryCells('ia1')}
                    {renderSummaryCells('ia2')}
                    {renderSummaryCells('ia3')}
                    <td colSpan={config.cos.length + 2}></td>
                    <td>{summary.see.passedCount}</td>
                    <td colSpan={2}></td>
                 </tr>
                 {footerRows.map(row => (
                    <tr key={row.label}>
                         <td colSpan={3} className="px-2 py-2 border-r dark:border-gray-600 text-left">{row.label}</td>
                         <td colSpan={18}></td>
                         {config.cos.map((co) => <td key={`${row.label}-${co}`}>{row.source[co][row.dataKey].toFixed(row.label === '%' || row.label === 'CO SCORE' ? 2 : 0)}{row.suffix}</td>)}
                         <td colSpan={6}></td>
                    </tr>
                 ))}
            </tfoot>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">CO-PO Attainment Calculation</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed attainment report based on the official template.</p>
                </div>
                <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="block w-full mt-4 sm:mt-0 sm:w-96 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    {assignedCourses.map(course => (
                        <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                    ))}
                </select>
            </div>
            
            <Card>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto border dark:border-gray-600 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                            {renderHeader()}
                            {renderBody()}
                            {renderFooter()}
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CoPoAttainmentPage;