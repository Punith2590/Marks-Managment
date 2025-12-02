import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/Card';
import { Icons } from '../shared/icons';
import { pos as defaultPos, psos as defaultPsos } from '../data/mockData';

const AdminConfigurationPage = () => {
    // --- State Management ---
    const [selectedScheme, setSelectedScheme] = useState('2022 Scheme');
    
    // 1. General Attainment Rules (Per Scheme)
    const [attainmentRules, setAttainmentRules] = useState({
        studentPassThreshold: 50, // % marks needed by a student to "attain" a CO (The "Y" count)
        maxAttainmentLevel: 3,    // Standard NBA scale 1-3
        levelThresholds: {
            level3: 70, // >70% students passed = Level 3
            level2: 60, // >60% students passed = Level 2
            level1: 50  // >50% students passed = Level 1
        },
        // Final PO Formula: (Direct * X) + (Indirect * Y)
        finalWeightage: {
            direct: 80,
            indirect: 20
        },
        // Direct Attainment Calculation: (CIE * X) + (SEE * Y)
        directSplit: {
            cie: 50,
            see: 50
        }
    });

    // 2. Indirect Assessment Tools (Surveys)
    const [indirectTools, setIndirectTools] = useState([
        { id: 'exit', name: 'Program Exit Survey', weight: 40 },
        { id: 'alumni', name: 'Alumni Survey', weight: 30 },
        { id: 'employer', name: 'Employer Survey', weight: 30 }
    ]);

    // 3. Outcomes
    const [pos, setPos] = useState(defaultPos);
    const [psos, setPsos] = useState(defaultPsos);

    // --- Handlers ---

    // Generic rule updater
    const updateRule = (category, field, value) => {
        setAttainmentRules(prev => {
            if (category) {
                return {
                    ...prev,
                    [category]: { ...prev[category], [field]: parseFloat(value) || 0 }
                };
            }
            return { ...prev, [field]: parseFloat(value) || 0 };
        });
    };

    const handleDirectWeightChange = (val) => {
        setAttainmentRules(prev => ({
            ...prev,
            finalWeightage: { direct: val, indirect: 100 - val }
        }));
    };

    const handleCieWeightChange = (val) => {
        setAttainmentRules(prev => ({
            ...prev,
            directSplit: { cie: val, see: 100 - val }
        }));
    };

    // Tool Handlers
    const handleToolChange = (id, field, value) => {
        setIndirectTools(tools => tools.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleSave = () => {
        console.log("Saving Configuration for", selectedScheme, { attainmentRules, indirectTools, pos, psos });
        alert(`Configuration for ${selectedScheme} saved successfully.`);
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Configuration</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1 font-medium">Define attainment rules, thresholds, and outcomes for the institution.</p>
                </div>
                <div className="flex gap-3">
                    <select 
                        value={selectedScheme} 
                        onChange={(e) => setSelectedScheme(e.target.value)}
                        className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900 font-medium dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option>2022 Scheme</option>
                        <option>2021 Scheme</option>
                        <option>2018 Scheme</option>
                    </select>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-bold"
                    >
                        <Icons.Settings className="h-4 w-4" /> Save All
                    </button>
                </div>
            </div>

            {/* --- 1. ATTAINMENT CRITERIA --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* A. Pass Criteria (The "Y" vs "N") */}
                <Card>
                    <CardHeader>
                        <CardTitle>Student Pass Criteria</CardTitle>
                        <CardDescription>Minimum score required for a student to "attain" a CO.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white">Target Score (%)</label>
                                <span className="text-xs text-gray-600 font-medium dark:text-gray-300">Threshold to count as "Y" (Attained)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={attainmentRules.studentPassThreshold}
                                    onChange={(e) => updateRule(null, 'studentPassThreshold', e.target.value)}
                                    className="w-20 rounded-md border-gray-300 text-gray-900 font-bold dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                                />
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-300">%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* B. Attainment Level Thresholds (The 1, 2, 3 Scale) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Class Performance Levels</CardTitle>
                        <CardDescription>Percentage of students required to achieve each level.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {['level3', 'level2', 'level1'].map((level, idx) => (
                            <div key={level} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    Level {3 - idx}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 font-medium dark:text-gray-400">Above</span>
                                    <input 
                                        type="number" 
                                        value={attainmentRules.levelThresholds[level]}
                                        onChange={(e) => updateRule('levelThresholds', level, e.target.value)}
                                        className="w-20 rounded-md border-gray-300 text-gray-900 font-semibold dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
                                    />
                                    <span className="text-xs text-gray-700 font-bold dark:text-gray-300">% Students</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* C. Direct Attainment Split (CIE vs SEE) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Direct Attainment Formula</CardTitle>
                        <CardDescription>Weightage of Internal (CIE) vs Semester End (SEE).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="text-gray-900 font-semibold dark:text-gray-200">CIE (Internals)</label>
                                <span className="font-bold text-primary-700 dark:text-primary-400">{attainmentRules.directSplit.cie}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" 
                                value={attainmentRules.directSplit.cie} 
                                onChange={(e) => handleCieWeightChange(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="text-gray-900 font-semibold dark:text-gray-200">SEE (University Exam)</label>
                                <span className="font-bold text-blue-700 dark:text-blue-400">{attainmentRules.directSplit.see}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" 
                                value={attainmentRules.directSplit.see} 
                                disabled
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* D. Final PO Attainment Split (Direct vs Indirect) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Final PO Attainment Formula</CardTitle>
                        <CardDescription>Calculation for Total PO Attainment.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="text-gray-900 font-semibold dark:text-gray-200">Direct Attainment (DA)</label>
                                <span className="font-bold text-primary-700 dark:text-primary-400">{attainmentRules.finalWeightage.direct}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" 
                                value={attainmentRules.finalWeightage.direct} 
                                onChange={(e) => handleDirectWeightChange(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="text-gray-900 font-semibold dark:text-gray-200">Indirect Attainment (IA)</label>
                                <span className="font-bold text-purple-700 dark:text-purple-400">{attainmentRules.finalWeightage.indirect}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" 
                                value={attainmentRules.finalWeightage.indirect} 
                                disabled
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- 2. INDIRECT TOOLS CONFIGURATION --- */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">Indirect Assessment Tools</h2>
            <Card>
                <CardContent className="p-0">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase dark:text-gray-200">Tool Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase dark:text-gray-200">Weightage (%)</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-800 uppercase dark:text-gray-200">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {indirectTools.map((tool) => (
                                <tr key={tool.id}>
                                    <td className="px-6 py-4">
                                        <input 
                                            value={tool.name}
                                            onChange={(e) => handleToolChange(tool.id, 'name', e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 text-sm font-bold text-gray-900 dark:text-white w-full dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="number"
                                            value={tool.weight}
                                            onChange={(e) => handleToolChange(tool.id, 'weight', e.target.value)}
                                            className="w-24 rounded border-gray-300 text-sm py-1 font-bold text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Fixed</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* --- 3. OUTCOME DEFINITIONS (POs/PSOs) --- */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">Outcome Definitions</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Program Outcomes (POs)</CardTitle></CardHeader>
                    <CardContent className="h-64 overflow-y-auto border-t border-gray-200 dark:border-gray-700 pt-2">
                        <ul className="space-y-2">
                            {pos.map(po => (
                                <li key={po.id} className="text-sm p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex gap-2">
                                    <span className="font-extrabold text-gray-900 dark:text-white w-12 shrink-0">{po.id}</span>
                                    <span className="text-gray-800 font-medium dark:text-gray-200 truncate">{po.description}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Program Specific Outcomes (PSOs)</CardTitle></CardHeader>
                    <CardContent className="h-64 overflow-y-auto border-t border-gray-200 dark:border-gray-700 pt-2">
                        <ul className="space-y-2">
                            {psos.map(pso => (
                                <li key={pso.id} className="text-sm p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex gap-2">
                                    <span className="font-extrabold text-gray-900 dark:text-white w-12 shrink-0">{pso.id}</span>
                                    <span className="text-gray-800 font-medium dark:text-gray-200 truncate">{pso.description}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminConfigurationPage;