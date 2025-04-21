import React, { useState, useEffect } from 'react';
import { simulateRetake, getGpaRules, getStudentProgramCourses, getSemesters, calculateCGPA } from '../Api/index';
import { KTIcon, toAbsoluteUrl } from '../../../../../_metronic/helpers';
import jsPDF from 'jspdf';
import { generateSimulationPdf } from '../utils/pdfGenerator';

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

interface Semester {
  semester_id: string;
  semester_name: string;
  start_date: string;
  end_date: string;
}

interface SimulationCourse {
  course_id: string;
  new_grade: string;
  semester_number: number;
}

interface SimulationResult {
  course_id: string;
  course_name: string;
  credits: number;
  new_grade: string;
  grade_points: number;
  is_new_course: boolean;
  semester_number?: number;
}

interface CourseSimulationProps {
  studentId: string;
  currentCgpa: number | null;
}

const CourseSimulation: React.FC<CourseSimulationProps> = ({ studentId, currentCgpa }) => {
  const [gpaRules, setGpaRules] = useState<GpaRule[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [simulateData, setSimulateData] = useState({ 
    course_id: '', 
    new_grade: '',
    semester_number: 1 
  });
  const [simulatedCgpa, setSimulatedCgpa] = useState<number | null>(null);
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [error, setError] = useState('');
  const [programCourses, setProgramCourses] = useState<ProgramCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<SimulationCourse[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [preSelectedGrades, setPreSelectedGrades] = useState<Record<string, string>>({});
  const [preSelectedSemesters, setPreSelectedSemesters] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [gpaRulesRes, semestersRes] = await Promise.all([
          getGpaRules(),
          getSemesters()
        ]);
        setGpaRules(gpaRulesRes.data);
        setSemesters(semestersRes.data);
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

  const handleGradeChange = async (courseId: string, newGrade: string) => {
    try {
      setSimulateLoading(true);
      setError('');

      // Update the pre-selected grade
      setPreSelectedGrades(prev => ({ ...prev, [courseId]: newGrade }));

      // If the course is already selected, update it and re-simulate
      if (selectedCourses.some(c => c.course_id === courseId)) {
        const updatedCourses = selectedCourses.map(c => 
          c.course_id === courseId ? { ...c, new_grade: newGrade } : c
        );
        setSelectedCourses(updatedCourses);
        await simulateGrades(updatedCourses);
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      setError('Failed to update grade. Please try again.');
    } finally {
      setSimulateLoading(false);
    }
  };

  const handleSemesterChange = (courseId: string, newSemesterNumber: number) => {
    setPreSelectedSemesters(prev => ({ ...prev, [courseId]: newSemesterNumber }));
    if (selectedCourses.some(c => c.course_id === courseId)) {
      setSelectedCourses(prev => prev.map(c => 
        c.course_id === courseId ? { ...c, semester_number: newSemesterNumber } : c
      ));
    }
  };

  const handleCheckboxChange = async (courseId: string, isChecked: boolean) => {
    try {
      setSimulateLoading(true);
      setError('');

      if (isChecked) {
        // Add the course to selected courses
        const newSelectedCourses = [...selectedCourses, {
          course_id: courseId,
          new_grade: preSelectedGrades[courseId] || '',
          semester_number: preSelectedSemesters[courseId] || 1
        }];

        // Validate that the new course has a grade
        if (!preSelectedGrades[courseId]) {
          setError('Please select a grade for the course before adding it');
          return;
        }

        setSelectedCourses(newSelectedCourses);
        await simulateGrades(newSelectedCourses);
      } else {
        // Remove the course and simulate with remaining courses
        const newSelectedCourses = selectedCourses.filter(c => c.course_id !== courseId);
        setSelectedCourses(newSelectedCourses);
        if (newSelectedCourses.length > 0) {
          await simulateGrades(newSelectedCourses);
        } else {
          setSimulatedCgpa(null);
          setSimulationResults([]);
        }
      }
    } catch (error) {
      console.error('Error in checkbox change:', error);
      setError('Failed to update simulation. Please try again.');
    } finally {
      setSimulateLoading(false);
    }
  };

  const simulateGrades = async (coursesToSimulate: typeof selectedCourses) => {
    try {
      const coursesForBackend = coursesToSimulate.map(({ course_id, new_grade }) => ({
        course_id,
        new_grade
      }));

      const response = await simulateRetake({
        student_id: studentId,
        courses: coursesForBackend
      });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Ensure simulatedCgpa is a number
      const newSimulatedCgpa = Number(response.data.simulated_cgpa);
      if (isNaN(newSimulatedCgpa)) {
        throw new Error('Invalid simulated CGPA value received');
      }

      setSimulatedCgpa(newSimulatedCgpa);
      const resultsWithSemester = response.data.simulation_results.map((result: Omit<SimulationResult, 'semester_number'>) => {
        const selectedCourse = coursesToSimulate.find(course => course.course_id === result.course_id);
        return {
          ...result,
          semester_number: selectedCourse?.semester_number || 1
        };
      });
      setSimulationResults(resultsWithSemester);
    } catch (error) {
      console.error('Error simulating grades:', error);
      throw error;
    }
  };

  // Get available courses (not already selected)
  const availableCourses = programCourses.filter(course => 
    !selectedCourses.some(selected => selected.course_id === course.course_id)
  );

  // Add filtered courses based on search query
  const filteredCourses = availableCourses.filter(course => {
    const searchLower = searchQuery.toLowerCase();
    return (
      course.course_name.toLowerCase().includes(searchLower) ||
      course.course_id.toLowerCase().includes(searchLower) ||
      (course.current_grade && course.current_grade.toLowerCase().includes(searchLower))
    );
  });

  // Group courses by semester
  const coursesBySemester = selectedCourses.reduce((acc, course) => {
    if (!acc[course.semester_number]) {
      acc[course.semester_number] = [];
    }
    acc[course.semester_number].push(course);
    return acc;
  }, {} as Record<number, SimulationCourse[]>);

  // Get unique semester numbers
  const semesterNumbers = Object.keys(coursesBySemester).map(Number).sort((a, b) => a - b);

  // Group simulation results by semester
  const simulationResultsBySemester = simulationResults.reduce((acc, result) => {
    // Find the corresponding selected course to get its semester number
    const selectedCourse = selectedCourses.find(course => course.course_id === result.course_id);
    if (selectedCourse) {
      const semesterNumber = selectedCourse.semester_number;
      if (!acc[semesterNumber]) {
        acc[semesterNumber] = [];
      }
      acc[semesterNumber].push(result);
    }
    return acc;
  }, {} as Record<number, SimulationResult[]>);

  // Get sorted semester numbers for simulation results
  const simulationSemesterNumbers = Object.keys(simulationResultsBySemester)
    .map(Number)
    .sort((a, b) => a - b);

  const formatResultsForSharing = () => {
    if (!simulationResults.length || simulatedCgpa === null) return '';

    let shareText = `🎓 Grade Simulation Results\n`;
    shareText += `Student ID: ${studentId}\n`;
    shareText += `Current CGPA: ${currentCgpa !== null ? currentCgpa.toFixed(2) : 'N/A'}\n`;
    shareText += `Simulated CGPA: ${typeof simulatedCgpa === 'number' ? simulatedCgpa.toFixed(2) : 'N/A'}\n\n`;

    // Group by semester
    const semesterGroups = simulationSemesterNumbers.map(semesterNumber => {
      const courses = simulationResultsBySemester[semesterNumber];
      let semesterText = `📚 Semester ${semesterNumber}\n`;
      courses.forEach(course => {
        semesterText += `• ${course.course_name} (${course.credits} credits)\n`;
        semesterText += `  New Grade: ${course.new_grade} (${course.grade_points.toFixed(2)} points)\n`;
        semesterText += `  Status: ${course.is_new_course ? 'New Course' : 'Retake'}\n`;
      });
      return semesterText;
    });

    return shareText + semesterGroups.join('\n');
  };

  const handleShare = async () => {
    try {
      const text = formatResultsForSharing();
      if (!text) {
        setError('No simulation results to share');
        return;
      }

      // Try clipboard first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
        return;
      }

      // Fallback to Web Share API
      if (navigator.share) {
        await navigator.share({
          title: 'Grade Simulation Results',
          text: text
        });
      } else {
        // If neither clipboard nor share API is available
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error sharing results:', error);
      setError('Failed to share results. Please try again.');
    }
  };

  const handlePdfDownload = async () => {
    try {
      setGeneratingPDF(true);
      
      // Log the values for debugging
      console.log('Current CGPA:', currentCgpa);
      console.log('Simulated CGPA:', simulatedCgpa);
      console.log('Simulation Results:', simulationResults);
      
      // Ensure simulatedCgpa is a number
      const simulatedCgpaValue = typeof simulatedCgpa === 'number' && !isNaN(simulatedCgpa) 
        ? simulatedCgpa 
        : null;
      
      await generateSimulationPdf({
        studentId,
        currentCgpa,
        simulatedCgpa: simulatedCgpaValue,
        simulationResults,
        onGeneratingChange: setGeneratingPDF
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className='d-flex flex-column gap-5'>
      {error && (
        <div className='alert alert-danger d-flex align-items-center p-5'>
          <KTIcon iconName='shield-cross' className='fs-2hx text-danger me-4' />
          <div className='d-flex flex-column'>
            <h4 className='mb-1 text-dark'>Error</h4>
            <span>{error}</span>
          </div>
        </div>
      )}

      {simulateLoading && (
        <div className='alert alert-info d-flex align-items-center p-5'>
          <KTIcon iconName='spinner' className='fs-2hx text-info me-4' />
          <div className='d-flex flex-column'>
            <h4 className='mb-1 text-dark'>Simulating</h4>
            <span>Updating simulation results...</span>
          </div>
        </div>
      )}

      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>Select Courses for Simulation</h3>
        </div>
        <div className='card-body'>
          <div className='mb-5'>
            <div className='d-flex align-items-center position-relative'>
              <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-4' />
              <input
                type='text'
                className='form-control form-control-solid w-250px ps-12'
                placeholder='Search courses by name, ID, or grade...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className='table-responsive'>
            <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
              <thead>
                <tr className='fw-bold text-muted'>
                  <th className='min-w-50px'>Select</th>
                  <th className='min-w-200px'>Course</th>
                  <th className='min-w-100px'>Credits</th>
                  <th className='min-w-100px'>Current Grade</th>
                  <th className='min-w-150px'>New Grade</th>
                  <th className='min-w-150px'>Semester</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr key={course.course_id}>
                      <td>
                        <div className='form-check form-check-sm form-check-custom form-check-solid'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            checked={selectedCourses.some(c => c.course_id === course.course_id)}
                            onChange={(e) => handleCheckboxChange(course.course_id, e.target.checked)}
                            disabled={simulateLoading}
                          />
                        </div>
                      </td>
                      <td>
                        <span className='text-dark fw-semibold text-hover-primary mb-1 fs-6'>
                          {course.course_name}
                        </span>
                        <span className='text-muted fw-semibold d-block fs-7'>
                          {course.course_id}
                        </span>
                      </td>
                      <td>{course.credits}</td>
                      <td>
                        <span className={`badge badge-light-${course.current_grade ? 'primary' : 'warning'}`}>
                          {course.current_grade || 'Not Taken'}
                        </span>
                      </td>
                      <td>
                        <select
                          className='form-select form-select-sm form-select-solid'
                          value={selectedCourses.find(c => c.course_id === course.course_id)?.new_grade || preSelectedGrades[course.course_id] || ''}
                          onChange={(e) => handleGradeChange(course.course_id, e.target.value)}
                          disabled={simulateLoading}
                        >
                          <option value=''>Select grade...</option>
                          {gpaRules.map((rule) => (
                            <option key={rule.letter_grade} value={rule.letter_grade}>
                              {rule.letter_grade}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className='form-select form-select-sm form-select-solid'
                          value={selectedCourses.find(c => c.course_id === course.course_id)?.semester_number || preSelectedSemesters[course.course_id] || 1}
                          onChange={(e) => handleSemesterChange(course.course_id, Number(e.target.value))}
                          disabled={simulateLoading}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <option key={num} value={num}>
                              Semester {num}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className='text-center py-5'>
                      <div className='text-gray-500 fw-semibold fs-6'>
                        {searchQuery ? 'No courses found matching your search' : 'No courses available'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedCourses.length > 0 && (
        <div className='card'>
          <div className='card-header'>
            <h3 className='card-title'>Selected Courses for Simulation</h3>
          </div>
          <div className='card-body'>
            <div className='table-responsive'>
              {semesterNumbers.map((semesterNumber) => (
                <div key={semesterNumber} className='mb-7'>
                  <h4 className='text-gray-800 mb-3'>Semester {semesterNumber}</h4>
                  <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
                    <thead>
                      <tr className='fw-bold text-muted'>
                        <th className='min-w-200px text-start'>Course</th>
                        <th className='min-w-150px text-start'>New Grade</th>
                        <th className='min-w-150px text-start'>Semester</th>
                        <th className='min-w-100px text-end'>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coursesBySemester[semesterNumber].map((course) => {
                        const courseInfo = programCourses.find(c => c.course_id === course.course_id);
                        return (
                          <tr key={course.course_id}>
                            <td className='text-start fw-semibold'>{courseInfo?.course_name || course.course_id}</td>
                            <td className='text-start'>
                              <select
                                className='form-select form-select-sm form-select-solid w-125px'
                                value={course.new_grade}
                                onChange={(e) => handleGradeChange(course.course_id, e.target.value)}
                              >
                                {gpaRules.map((rule) => (
                                  <option key={rule.letter_grade} value={rule.letter_grade}>
                                    {rule.letter_grade}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className='text-start'>
                              <select
                                className='form-select form-select-sm form-select-solid w-125px'
                                value={course.semester_number}
                                onChange={(e) => handleSemesterChange(course.course_id, Number(e.target.value))}
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                  <option key={num} value={num}>
                                    Semester {num}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className='text-end'>
                              <button
                                className='btn btn-sm btn-light-danger'
                                onClick={() => handleCheckboxChange(course.course_id, false)}
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
              ))}
            </div>
          </div>
        </div>
      )}

      {simulatedCgpa !== null && (
        <div className='alert alert-info'>
          <div className='d-flex justify-content-between align-items-center'>
            <span className='fw-bold fs-3'>
              Simulated CGPA: {typeof simulatedCgpa === 'number' ? simulatedCgpa.toFixed(2) : 'N/A'}
            </span>
            <div className='d-flex gap-2'>
              <button
                className={`btn btn-sm ${generatingPDF ? 'btn-light disabled' : 'btn-primary'}`}
                onClick={handlePdfDownload}
                disabled={generatingPDF}
              >
                <KTIcon iconName={generatingPDF ? 'file' : 'download'} className='fs-2 me-2' />
                {generatingPDF ? 'Generating PDF...' : 'Download PDF'}
              </button>
              <button
                className='btn btn-sm btn-success'
                onClick={handleShare}
                disabled={copySuccess}
              >
                <KTIcon iconName={copySuccess ? 'check' : 'share'} className='fs-2 me-2' />
                {copySuccess ? 'Copied!' : 'Copy Results'}
              </button>
            </div>
          </div>
        </div>
      )}

      {simulationResults.length > 0 && (
        <div className='table-responsive'>
          <h3 className='card-title align-items-start flex-column mb-5'>
            <span className='card-label fw-bold fs-3 mb-1'>Simulation Results</span>
          </h3>
          {simulationSemesterNumbers.map((semesterNumber) => (
            <div key={semesterNumber} className='mb-7'>
              <h4 className='text-gray-800 mb-3'>Semester {semesterNumber}</h4>
              <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
                <thead>
                  <tr className='fw-bold text-muted'>
                    <th className='min-w-200px text-start'>Course</th>
                    <th className='min-w-100px text-start'>Credits</th>
                    <th className='min-w-100px text-start'>New Grade</th>
                    <th className='min-w-100px text-start'>Grade Points</th>
                    <th className='min-w-100px text-end'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResultsBySemester[semesterNumber].map((result) => (
                    <tr key={result.course_id}>
                      <td className='text-start fw-semibold'>{result.course_name}</td>
                      <td className='text-start'>{result.credits}</td>
                      <td className='text-start'>{result.new_grade}</td>
                      <td className='text-start'>{typeof result.grade_points === 'number' ? result.grade_points.toFixed(2) : result.grade_points}</td>
                      <td className='text-end'>
                        <span className={`badge badge-light-${result.is_new_course ? 'success' : 'warning'}`}>
                          {result.is_new_course ? 'New Course' : 'Retake'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseSimulation; 