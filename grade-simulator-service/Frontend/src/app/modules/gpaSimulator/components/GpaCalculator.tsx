import React, { useState, useEffect } from 'react';
import { calculateCGPA, simulateRetake, getGpaRules, getStudentCourses } from '../../../Api/api';
import { KTIcon } from '../../../../_metronic/helpers';

const GpaCalculator = () => {
  const [gpaRules, setGpaRules] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [cgpa, setCgpa] = useState(null);
  const [simulateData, setSimulateData] = useState({ 
    student_id: '', 
    course_id: '', 
    new_grade: '' 
  });
  const [simulatedCgpa, setSimulatedCgpa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentCourses, setStudentCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

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
    const fetchStudentCourses = async () => {
      if (simulateData.student_id) {
        try {
          setCoursesLoading(true);
          const response = await getStudentCourses(simulateData.student_id);
          const coursesFromGrades = response.data.grades.map(grade => grade.course);
          setStudentCourses(coursesFromGrades);
          setError('');
        } catch (error) {
          console.error('Error fetching student courses:', error);
          setError('Failed to load student courses');
          setStudentCourses([]);
        } finally {
          setCoursesLoading(false);
        }
      }
    };

    fetchStudentCourses();
  }, [simulateData.student_id]);

  const handleCalculateCGPA = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const response = await calculateCGPA(studentId);
      setCgpa(response.data.cgpa);
      setError('');
    } catch (error) {
      console.error('Error calculating CGPA:', error);
      setError('Failed to calculate CGPA - Please check Student ID');
      setCgpa(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateRetake = async () => {
    if (!simulateData.student_id || !simulateData.course_id || !simulateData.new_grade) return;
    try {
      setSimulateLoading(true);
      const response = await simulateRetake(simulateData);
      setSimulatedCgpa(response.data.simulated_cgpa);
      setError('');
    } catch (error) {
      console.error('Error simulating retake:', error);
      setError('Failed to simulate retake - Please check inputs');
      setSimulatedCgpa(null);
    } finally {
      setSimulateLoading(false);
    }
  };

  return (
    <div className='card'>
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>GPA Simulator</span>
          <span className='text-muted mt-1 fw-semibold fs-7'>Calculate and simulate academic scenarios</span>
        </h3>
      </div>
      
      <div className='card-body pt-0'>
        {error && (
          <div className='alert alert-danger d-flex align-items-center p-5 mb-10'>
            <KTIcon iconName='cross-circle' className='fs-2hx text-danger me-3' />
            <div className='d-flex flex-column'>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className='row g-5'>
          {/* Current CGPA Section */}
          <div className='col-md-6'>
            <div className='card card-flush h-md-100'>
              <div className='card-header'>
                <h3 className='card-title fw-bold text-gray-800'>Current CGPA Calculator</h3>
              </div>
              <div className='card-body pt-1'>
                <div className='mb-10'>
                  <label className='form-label'>Student ID</label>
                  <input
                    type="text"
                    className='form-control form-control-solid'
                    placeholder="Enter Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
                
                <button 
                  className='btn btn-primary w-100'
                  onClick={handleCalculateCGPA}
                  disabled={!studentId || loading}
                >
                  {loading ? (
                    <span className='indicator-progress' style={{display: 'block'}}>
                      Please wait... <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                    </span>
                  ) : (
                    'Calculate CGPA'
                  )}
                </button>

                {cgpa && (
                  <div className='alert alert-success mt-5'>
                    <div className='d-flex align-items-center'>
                      <KTIcon iconName='tick-circle' className='fs-2hx text-success me-3' />
                      <span className='fw-bold'>Current CGPA: {cgpa}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Simulation Section */}
          <div className='col-md-6'>
            <div className='card card-flush h-md-100'>
              <div className='card-header'>
                <h3 className='card-title fw-bold text-gray-800'>Retake Simulation</h3>
              </div>
              <div className='card-body pt-1'>
                <div className='mb-10'>
                  <label className='form-label'>Student ID</label>
                  <input
                    type="text"
                    className='form-control form-control-solid'
                    placeholder="Enter Student ID"
                    value={simulateData.student_id}
                    onChange={(e) => setSimulateData({
                      student_id: e.target.value,
                      course_id: '',
                      new_grade: ''
                    })}
                  />
                </div>

                <div className='mb-10'>
                  <label className='form-label'>Course</label>
                  <select
                    className='form-select form-select-solid'
                    value={simulateData.course_id}
                    onChange={(e) => setSimulateData({ ...simulateData, course_id: e.target.value })}
                    disabled={coursesLoading || !simulateData.student_id}
                  >
                    <option value=''>Choose course...</option>
                    {coursesLoading ? (
                      <option disabled>Loading student courses...</option>
                    ) : (
                      studentCourses.map((course) => (
                        <option key={course.course_id} value={course.course_id}>
                          {course.name} ({course.course_id})
                        </option>
                      ))
                    )}
                    {studentCourses.length === 0 && !coursesLoading && (
                      <option disabled>No courses found for this student</option>
                    )}
                  </select>
                </div>

                <div className='mb-10'>
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

                <button 
                  className='btn btn-danger w-100'
                  onClick={handleSimulateRetake}
                  disabled={!simulateData.student_id || !simulateData.course_id || !simulateData.new_grade || simulateLoading}
                >
                  {simulateLoading ? (
                    <span className='indicator-progress' style={{display: 'block'}}>
                      Simulating... <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                    </span>
                  ) : (
                    'Simulate Retake'
                  )}
                </button>

                {simulatedCgpa && (
                  <div className='alert alert-info mt-5'>
                    <div className='d-flex align-items-center'>
                      <KTIcon iconName='abstract-11' className='fs-2hx text-info me-3' />
                      <div>
                        <span className='fw-bold'>Simulated CGPA: {simulatedCgpa}</span>
                        <div className='fs-7 text-muted'>Based on selected parameters</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='mt-10 text-center text-muted'>
          <KTIcon iconName='shield-tick' className='fs-2' />
          <div className='fw-semibold fs-7'>Calculations based on official GPA rules</div>
        </div>
      </div>
    </div>
  );
};

export default GpaCalculator;