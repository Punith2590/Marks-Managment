import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/Card';
import { pos as mockPos, psos as mockPsos } from '../data/mockData';

const SurveyCard = ({ title, description, outcomes, ratings, onRatingChange }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-24">Outcome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-40">Rating (1-3)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {outcomes.map(outcome => (
                                <tr key={outcome.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{outcome.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{outcome.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="number"
                                            min="1"
                                            max="3"
                                            step="0.1"
                                            value={ratings[outcome.id] || ''}
                                            onChange={(e) => onRatingChange(outcome.id, e.target.value)}
                                            className="w-24 h-10 text-center border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                                            aria-label={`Rating for ${outcome.id}`}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

const IndirectAttainmentPage = () => {
    const [surveyRatings, setSurveyRatings] = useState({
        exitSurvey: {},
        employerSurvey: {},
        alumniSurvey: {}
    });
    
    const allOutcomes = [...mockPos, ...mockPsos];

    // Initialize with some mock data
    useEffect(() => {
        const initialRatings = {
            exitSurvey: {},
            employerSurvey: {},
            alumniSurvey: {}
        };

        allOutcomes.forEach(outcome => {
            initialRatings.exitSurvey[outcome.id] = parseFloat((Math.random() * (2.8 - 2.2) + 2.2).toFixed(2));
            initialRatings.employerSurvey[outcome.id] = parseFloat((Math.random() * (2.9 - 2.3) + 2.3).toFixed(2));
            initialRatings.alumniSurvey[outcome.id] = parseFloat((Math.random() * (3.0 - 2.5) + 2.5).toFixed(2));
        });

        setSurveyRatings(initialRatings);
    }, []);

    const handleRatingChange = (surveyType, outcomeId, value) => {
        const numericValue = parseFloat(value);
        setSurveyRatings(prevRatings => ({
            ...prevRatings,
            [surveyType]: {
                ...prevRatings[surveyType],
                [outcomeId]: isNaN(numericValue) ? '' : Math.max(1, Math.min(3, numericValue))
            }
        }));
    };

    const handleSaveChanges = () => {
        // In a real app, this would be an API call to save the data.
        alert('Survey ratings saved successfully!');
        console.log('Saved Data:', surveyRatings);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Indirect Attainment Surveys</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Collect and manage feedback from program stakeholders to calculate indirect attainment.
                    </p>
                </div>
                <button
                    onClick={handleSaveChanges}
                    className="mt-4 sm:mt-0 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                >
                    Save Changes
                </button>
            </div>

            <SurveyCard
                title="Program Exit Survey"
                description="Feedback collected from graduating students about their perception of outcome achievement."
                outcomes={allOutcomes}
                ratings={surveyRatings.exitSurvey}
                onRatingChange={(outcomeId, value) => handleRatingChange('exitSurvey', outcomeId, value)}
            />

            <SurveyCard
                title="Employer Survey"
                description="Feedback from employers regarding the performance and capabilities of graduates in the workplace."
                outcomes={allOutcomes}
                ratings={surveyRatings.employerSurvey}
                onRatingChange={(outcomeId, value) => handleRatingChange('employerSurvey', outcomeId, value)}
            />

            <SurveyCard
                title="Alumni Survey"
                description="Feedback from alumni on how well the program prepared them for their careers, collected a few years after graduation."
                outcomes={allOutcomes}
                ratings={surveyRatings.alumniSurvey}
                onRatingChange={(outcomeId, value) => handleRatingChange('alumniSurvey', outcomeId, value)}
            />
        </div>
    );
};

export default IndirectAttainmentPage;