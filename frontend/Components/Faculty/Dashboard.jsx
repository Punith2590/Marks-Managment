import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/Card';
import { Icons } from '../shared/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { attainmentSummary, courses, studentsByCourse, coursePerformanceData } from '../data/mockData';
import { useAuth } from '../auth/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // Or a loading spinner
  }

  const assignedCourses = courses.filter(c => c.assignedFacultyId === user.id);
  const assignedCoursePerformanceData = coursePerformanceData.filter(d => 
    assignedCourses.some(c => c.id === d.courseId)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome, {user.name.split(' ')[1]}!</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's a summary of your activities and courses.</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Total Attainment</CardTitle>
            <Icons.Target className="h-5 w-5 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{attainmentSummary.totalAttainment}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Overall Program Attainment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Direct Attainment</CardTitle>
             <Icons.Reports className="h-5 w-5 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{attainmentSummary.directAttainment}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Based on CIE and SEE marks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Indirect Attainment</CardTitle>
            <Icons.Syllabus className="h-5 w-5 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{attainmentSummary.indirectAttainment}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Based on course end surveys</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>CO Attainment Level</CardTitle>
            <Icons.Course className="h-5 w-5 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{attainmentSummary.coAttainmentLevel} / 3</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Average across all courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>My Assigned Courses</CardTitle>
                <CardDescription>An overview of the courses you are teaching this semester.</CardDescription>
            </CardHeader>
            <CardContent>
                {assignedCourses.length > 0 ? (
                  <ul className="space-y-4">
                      {assignedCourses.map(course => (
                          <li key={course.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                              <div className="flex items-center">
                                  <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-md mr-4">
                                      <Icons.Course className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                                  </div>
                                  <div>
                                      <p className="font-semibold text-gray-800 dark:text-gray-100">{course.code} - {course.name}</p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">{studentsByCourse[course.id]?.length || 0} Students</p>
                                  </div>
                              </div>
                              <Icons.ChevronRight className="h-5 w-5 text-gray-400" />
                          </li>
                      ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <Icons.Course className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Courses Assigned</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Contact your department admin to get courses assigned.</p>
                  </div>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump directly to your common tasks.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
                <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={assignedCourses.length === 0}>
                    <Icons.MarksEntry className="w-5 h-5 mr-2" />
                    Enter Marks
                </button>
                <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={assignedCourses.length === 0}>
                    <Icons.ArticulationMatrix className="w-5 h-5 mr-2" />
                    Update Articulation
                </button>
            </CardContent>
        </Card>
      </div>

       {/* Course Performance Chart */}
      <Card>
          <CardHeader>
            <CardTitle>Course Performance Overview</CardTitle>
            <CardDescription>Comparison of attainment levels across your assigned courses.</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedCoursePerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assignedCoursePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      backdropFilter: 'blur(5px)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="target" fill="#93c5fd" name="Target" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attained" fill="#1d4ed8" name="Attained" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    No performance data available for your assigned courses.
                </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
};

export default Dashboard;