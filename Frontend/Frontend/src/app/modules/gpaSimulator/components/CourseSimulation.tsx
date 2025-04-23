import React, { useState, useEffect } from 'react';
import { simulateRetake, getGpaRules, getStudentProgramCourses } from '../../../Api/api';
import { KTIcon } from '../../../../_metronic/helpers';

interface ProgramCourse {
  course_id: string;
  course_name: string;
  credits: number;
  category: string;
  current_grade: string | null;
  is_taken: boolean;
  grade_points: number | null;
  semester_id: string | null;
}

interface GpaRule {
  letter_grade: string;
  gpa_points: number;
  min_percentage: number;
  max_percentage: number;
}

interface SimulationCourse {
  course_id: string;
  new_grade: string;
}

interface CourseSimulationProps {
  studentId: string;
}

const CourseSimulation: React.FC<CourseSimulationProps> = ({ studentId }) => {
  const [gpaRules, setGpaRules] = useState<GpaRule[]>([]);
  const [simulateData, setSimulateData] = useState({ 
    course_id: '', 
    new_grade: '' 
  });
  const [simulatedCgpa, setSimulatedCgpa] = useState<number | null>(null);
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [error, setError] = useState('');
  const [programCourses, setProgramCourses] = useState<ProgramCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<SimulationCourse[]>([]);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const gpaRulesRes = await getGpaRules();
        setGpaRules(gpaRulesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load initial data');
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchStudentProgramCourses = async () => {
      if (studentId) {
        try {
          setCoursesLoading(true);
          const response = await getStudentProgramCourses(studentId);
          setProgramCourses(response.data.courses);
          setError('');
        } catch (error) {
          console.error('Error fetching student program courses:', error);
          setError('Failed to load student courses');
          setProgramCourses([]);
        } finally {
          setCoursesLoading(false);
        }
      }
    };

    fetchStudentProgramCourses();
  }, [studentId]);

  const handleAddCourse = () => {
    if (!simulateData.course_id || !simulateData.new_grade) return;

    setSelectedCourses(prev => [...prev, {
      course_id: simulateData.course_id,
      new_grade: simulateData.new_grade
    }]);

    // Reset the form
    setSimulateData({
      course_id: '',
      new_grade: ''
    });
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(prev => prev.filter(course => course.course_id !== courseId));
  };

  const handleSimulateMultiple = async () => {
    if (!studentId || selectedCourses.length === 0) return;

    try {
      setSimulateLoading(true);
      const response = await simulateRetake({
        student_id: studentId,
        courses: selectedCourses
      });
      setSimulatedCgpa(response.data.simulated_cgpa);
      setSimulationResults(response.data.simulation_results);
      setError('');
    } catch (error) {
      console.error('Error simulating multiple courses:', error);
      setError('Failed to simulate courses - Please check inputs');
      setSimulatedCgpa(null);
      setSimulationResults([]);
    } finally {
      setSimulateLoading(false);
    }
  };

  // Get available courses (not already selected)
  const availableCourses = programCourses.filter(course => 
    !selectedCourses.some(selected => selected.course_id === course.course_id)
  );

  return (
    <div className='d-flex flex-column gap-5'>
      <div className='d-flex gap-4'>
        <div className='flex-grow-1'>
          <label className='form-label'>Course</label>
          <select
            className='form-select form-select-solid'
            value={simulateData.course_id}
            onChange={(e) => setSimulateData({ ...simulateData, course_id: e.target.value })}
            disabled={coursesLoading || !studentId}
          >
            <option value=''>Choose course...</option>
            {coursesLoading ? (
              <option disabled>Loading student courses...</option>
            ) : (
              availableCourses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name} ({course.course_id}) 
                  {!course.is_taken ? ' - Not Taken' : ` - Current Grade: ${course.current_grade}`}
                </option>
              ))
            )}
            {availableCourses.length === 0 && !coursesLoading && (
              <option disabled>No courses available</option>
            )}
          </select>
        </div>
        <div className='flex-grow-1'>
          <label className='form-label'>New Grade</label>
          <select
            className='form-select form-select-solid'
            value={simulateData.new_grade}
            onChange={(e) => setSimulateData({ ...simulateData, new_grade: e.target.value })}
            disabled={!simulateData.course_id}
          >
            <option value=''>Select grade...</option>
            {gpaRules.map((rule) => (
              <option key={rule.letter_grade} value={rule.letter_grade}>
                {rule.letter_grade}
              </option>
            ))}
          </select>
        </div>
        <div className='d-flex align-items-end'>
          <button
            className='btn btn-primary'
            onClick={handleAddCourse}
            disabled={!simulateData.course_id || !simulateData.new_grade}
          >
            Add Course
          </button>
        </div>
      </div>

      {selectedCourses.length > 0 && (
        <div className='mb-10'>
          <label className='form-label'>Selected Courses</label>
          <div className='table-responsive'>
            <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
              <thead>
                <tr className='fw-bold text-muted'>
                  <th>Course</th>
                  <th>New Grade</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedCourses.map((course) => {
                  const courseInfo = programCourses.find(c => c.course_id === course.course_id);
                  return (
                    <tr key={course.course_id}>
                      <td>{courseInfo?.course_name || course.course_id}</td>
                      <td>{course.new_grade}</td>
                      <td>
                        <button
                          className='btn btn-sm btn-light-danger'
                          onClick={() => handleRemoveCourse(course.course_id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        className='btn btn-primary'
        onClick={handleSimulateMultiple}
        disabled={!studentId || selectedCourses.length === 0 || simulateLoading}
      >
        {simulateLoading ? 'Simulating...' : 'Simulate Grades'}
      </button>

      {error && (
        <div className='alert alert-danger'>
          {error}
        </div>
      )}

      {simulatedCgpa !== null && (
        <div className='alert alert-info'>
          <div className='d-flex flex-column'>
            <span className='fw-bold'>Simulated CGPA: {simulatedCgpa}</span>
          </div>
        </div>
      )}

      {simulationResults.length > 0 && (
        <div className='table-responsive'>
          <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
            <thead>
              <tr className='fw-bold text-muted'>
                <th>Course</th>
                <th>Credits</th>
                <th>New Grade</th>
                <th>Grade Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {simulationResults.map((result) => (
                <tr key={result.course_id}>
                  <td>{result.course_name}</td>
                  <td>{result.credits}</td>
                  <td>{result.new_grade}</td>
                  <td>{result.grade_points}</td>
                  <td>
                    <span className={`badge badge-${result.is_new_course ? 'success' : 'warning'}`}>
                      {result.is_new_course ? 'New Course' : 'Retake'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CourseSimulation; 