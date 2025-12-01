import React, { useState, useMemo, useEffect } from 'react';
import { courses as mockCourses, studentsByCourse } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/Card';
import { useAuth } from '../auth/AuthContext';
import { Save, Pencil, Lock, Unlock, Check } from 'lucide-react';

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
  const [editableRows, setEditableRows] = useState({}); // Track editable state for each student row
  const [showSuccess, setShowSuccess] = useState(false); // State for custom success notification
  
  const handleSelectionChange = () => {
      setIsTableVisible(false);
      setCurrentStudents([]);
      setMarks({});
      setEditableRows({});
      setShowSuccess(false);
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
    setEditableRows({}); // Reset edit states

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

  const toggleEditRow = (studentId) => {
    setEditableRows(prev => ({
        ...prev,
        [studentId]: !prev[studentId]
    }));
  };

  const handleSaveChanges = () => {
    // In a real app, you would send 'marks' to the backend here
    console.log("Saving Marks:", marks);
    
    // Show custom notification instead of window.alert
    setShowSuccess(true);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        setShowSuccess(false);
    }, 3000);

    setEditableRows({}); // Lock all rows after saving
  };


  return (
    <div className="space-y-6 relative">
      {/* Custom Success Notification */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
            <div className="bg-white dark:bg-gray-800 border-l-4 border-green-500 shadow-lg rounded-r-lg pointer-events-auto flex items-center p-4 min-w-[300px]">
                <div className="flex-shrink-0 text-green-500">
                    <Check className="h-6 w-6" />
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Success
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Marks saved successfully!
                    </p>
                </div>
                <button 
                    onClick={() => setShowSuccess(false)}
                    className="ml-auto pl-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Marks Entry</h1>
        {isTableVisible && (
            <button
                onClick={handleSaveChanges}
                className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium shadow-sm transition-colors"
            >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
            </button>
        )}
      </div>

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
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-l dark:border-gray-600">
                        Total
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-l dark:border-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentStudents.map(student => {
                      const isEditing = editableRows[student.id];
                      return (
                        <tr key={student.id} className={isEditing ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                          <td className="sticky left-0 bg-inherit px-4 py-4 text-sm font-mono text-gray-700 dark:text-gray-300 border-r dark:border-gray-600">{student.usn}</td>
                          <td className="sticky left-40 bg-inherit px-4 py-4 text-sm font-medium text-gray-900 dark:text-white border-r dark:border-gray-600">{student.name}</td>
                          
                          {currentAssessmentConfig.isExternal ? (
                             <td className="px-3 py-2 whitespace-nowrap text-center text-sm">
                               <input
                                 type="number"
                                 min="0"
                                 disabled={!isEditing}
                                 max={currentAssessmentConfig.total}
                                 value={marks[student.id]?.['external'] ?? ''}
                                 onChange={e => handleMarksChange(student.id, 'external', e.target.value)}
                                 className="w-20 h-10 text-center border rounded-md disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                 aria-label={`External Marks for ${student.name}`}
                               />
                             </td>
                          ) : (
                              currentAssessmentConfig.questions.map(q => (
                                  <td key={`${student.id}-${q.q}`} className="px-3 py-2 whitespace-nowrap text-center text-sm">
                                      <input
                                      type="number"
                                      min="0"
                                      disabled={!isEditing}
                                      max={q.max}
                                      value={marks[student.id]?.[q.q] ?? ''}
                                      onChange={e => handleMarksChange(student.id, q.q, e.target.value)}
                                      className="w-16 h-10 text-center border rounded-md disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                      aria-label={`Marks for ${student.name} in ${q.q}`}
                                      />
                                  </td>
                              ))
                          )}
                          <td className="px-4 py-4 text-center font-bold text-gray-800 dark:text-gray-100 border-l dark:border-gray-600">
                            {calculateTotal(student.id)}
                          </td>
                          <td className="px-4 py-4 text-center border-l dark:border-gray-600">
                            <button
                                onClick={() => toggleEditRow(student.id)}
                                className={`p-2 rounded-md transition-colors ${
                                    isEditing 
                                    ? "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30" 
                                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                }`}
                                title={isEditing ? "Finish Editing" : "Edit Marks"}
                            >
                                {isEditing ? <Unlock className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
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
      )}
    </div>
  );
};

export default MarksEntryPage;