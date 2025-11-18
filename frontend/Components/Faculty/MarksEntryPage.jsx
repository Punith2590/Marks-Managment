import React, { useState, useMemo, useEffect } from 'react';
import { courses as mockCourses, studentsByCourse } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/Card';
import { useAuth } from '../auth/AuthContext';

const ASSESSMENT_CONFIG = {
    'Internal Assessment 1': { questions: [{ q: 'Part A', co: 'CO1', max: 15 }, { q: 'Part B', co: 'CO2', max: 15 }], total: 30 },
    'Internal Assessment 2': { questions: [{ q: 'Part A', co: 'CO2', max: 15 }, { q: 'Part B', co: 'CO3', max: 15 }], total: 30 },
    'Internal Assessment 3': { questions: [{ q: 'Part A', co: 'CO4', max: 15 }, { q: 'Part B', co: 'CO5', max: 15 }], total: 30 },
    'Assignment 1': { questions: [{ q: 'Part A', co: 'CO1', max: 10 }, { q: 'Part B', co: 'CO2', max: 10 }], total: 20 },
    'Assignment 2': { questions: [{ q: 'Part A', co: 'CO2', max: 10 }, { q: 'Part B', co: 'CO3', max: 10 }], total: 20 },
    'Assignment 3': { questions: [{ q: 'Part A', co: 'CO4', max: 10 }, { q: 'Part B', co: 'CO5', max: 10 }], total: 20 },
    'Semester End Exam': { questions: [], total: 100, isExternal: true },
};

const assessmentOptions = Object.keys(ASSESSMENT_CONFIG);

const MarksEntryPage = () => {
  const { user } = useAuth();

  const assignedCourses = useMemo(() => {
    if (!user) return [];
    return mockCourses.filter(c => c.assignedFacultyId === user.id);
  }, [user]);

  const [selectedCourseId, setSelectedCourseId] = useState(assignedCourses[0]?.id ?? '');
  const [selectedAssessment, setSelectedAssessment] = useState(assessmentOptions[0]);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [currentStudents, setCurrentStudents] = useState([]);
  const [marks, setMarks] = useState({});
  
  const handleSelectionChange = () => {
      setIsTableVisible(false);
      setCurrentStudents([]);
      setMarks({});
  };

  useEffect(() => {
    if (assignedCourses.length > 0 && !assignedCourses.some(c => c.id === selectedCourseId)) {
        setSelectedCourseId(assignedCourses[0].id);
        handleSelectionChange();
    } else if (assignedCourses.length === 0) {
        setSelectedCourseId('');
        handleSelectionChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedCourses]);

  const selectedCourse = assignedCourses.find(c => c.id === selectedCourseId);
  const currentAssessmentConfig = useMemo(() => ASSESSMENT_CONFIG[selectedAssessment], [selectedAssessment]);

  const handleLoadStudents = () => {
    const studentsForCourse = studentsByCourse[selectedCourseId] || [];
    setCurrentStudents(studentsForCourse);

    const initialMarks = {};
    studentsForCourse.forEach(student => {
        initialMarks[student.id] = {};
    });
    setMarks(initialMarks);

    setIsTableVisible(true);
  };
  

  const handleMarksChange = (studentId, questionIdentifier, value) => {
    const newMarks = JSON.parse(JSON.stringify(marks));

    const max = currentAssessmentConfig.isExternal 
        ? currentAssessmentConfig.total 
        : currentAssessmentConfig.questions.find(q => q.q === questionIdentifier)?.max || 0;
    
    if (value === '') {
        delete newMarks[studentId][questionIdentifier];
        setMarks(newMarks);
        return;
    }

    let numValue = parseInt(value, 10);
    
    if (!isNaN(numValue)) {
        numValue = Math.max(0, Math.min(numValue, max));
        newMarks[studentId][questionIdentifier] = numValue;
        setMarks(newMarks);
    }
  };

  const calculateTotal = (studentId) => {
      const studentMarks = marks[studentId];
      if (!studentMarks) return 0;
      return Object.values(studentMarks).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Marks Entry</h1>
      <Card>
        <CardHeader>
          <CardTitle>Select Course and Assessment</CardTitle>
          <CardDescription>Choose the course and assessment for which you want to enter marks.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
               <div className="sm:col-span-1">
                 <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                 <select 
                    id="course-select"
                    value={selectedCourseId}
                    onChange={(e) => {
                        setSelectedCourseId(e.target.value);
                        handleSelectionChange();
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={assignedCourses.length === 0}
                >
                    {assignedCourses.length > 0 ? assignedCourses.map(course => (
                      <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                    )) : <option>No courses assigned</option>}
                  </select>
               </div>
               <div className="sm:col-span-1">
                <label htmlFor="assessment-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assessment</label>
                 <select 
                    id="assessment-select"
                    value={selectedAssessment}
                    onChange={(e) => {
                        setSelectedAssessment(e.target.value);
                        handleSelectionChange();
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                     {assessmentOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
               </div>
               <div className="sm:col-span-1">
                 <button 
                    onClick={handleLoadStudents}
                    className="w-full justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!selectedCourseId}
                >
                    Load Student List
                 </button>
               </div>
            </div>
        </CardContent>
      </Card>

      {isTableVisible && selectedCourse && currentAssessmentConfig && (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>{selectedCourse.code} - {selectedCourse.name}</CardTitle>
                <CardDescription>Entering marks for: <span className="font-semibold">{selectedAssessment}</span></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="sticky left-0 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r dark:border-gray-600">
                        USN
                      </th>
                      <th scope="col" className="sticky left-40 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r dark:border-gray-600">
                        Student Name
                      </th>
                      {currentAssessmentConfig.isExternal ? (
                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                           External Marks <span className="font-normal normal-case">[{currentAssessmentConfig.total}M]</span>
                        </th>
                      ) : (
                        currentAssessmentConfig.questions.map(q => (
                         <th key={q.q} scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                           {q.q} ({q.co}) <span className="font-normal normal-case">[{q.max}M]</span>
                         </th>
                        ))
                      )}
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentStudents.map(student => (
                      <tr key={student.id}>
                        <td className="sticky left-0 bg-white dark:bg-gray-800 px-4 py-4 text-sm font-mono text-gray-700 dark:text-gray-300 border-r dark:border-gray-600">{student.usn}</td>
                        <td className="sticky left-40 bg-white dark:bg-gray-800 px-4 py-4 text-sm font-medium text-gray-900 dark:text-white border-r dark:border-gray-600">{student.name}</td>
                        {currentAssessmentConfig.isExternal ? (
                           <td className="px-3 py-2 whitespace-nowrap text-center text-sm">
                             <input
                               type="number"
                               min="0"
                               max={currentAssessmentConfig.total}
                               value={marks[student.id]?.['external'] ?? ''}
                               onChange={e => handleMarksChange(student.id, 'external', e.target.value)}
                               className="w-20 h-10 text-center border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                               aria-label={`External Marks for ${student.name}`}
                             />
                           </td>
                        ) : (
                            currentAssessmentConfig.questions.map(q => (
                                <td key={`${student.id}-${q.q}`} className="px-3 py-2 whitespace-nowrap text-center text-sm">
                                    <input
                                    type="number"
                                    min="0"
                                    max={q.max}
                                    value={marks[student.id]?.[q.q] ?? ''}
                                    onChange={e => handleMarksChange(student.id, q.q, e.target.value)}
                                    className="w-16 h-10 text-center border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                                    aria-label={`Marks for ${student.name} in ${q.q}`}
                                    />
                                </td>
                            ))
                        )}
                        <td className="px-4 py-4 text-center font-bold text-gray-800 dark:text-gray-100">
                          {calculateTotal(student.id)}
                        </td>
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

export default MarksEntryPage;