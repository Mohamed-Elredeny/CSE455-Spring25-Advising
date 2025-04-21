import React, { useState, useEffect } from 'react';
import { simulateRetake, getGpaRules, getStudentProgramCourses, getSemesters } from '../Api/index';
import { KTIcon, toAbsoluteUrl } from '../../../../../_metronic/helpers'
import jsPDF from 'jspdf';

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
}

const CourseSimulation: React.FC<CourseSimulationProps> = ({ studentId }) => {
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

  const handleAddCourse = () => {
    if (!simulateData.course_id || !simulateData.new_grade) return;

    setSelectedCourses(prev => [...prev, {
      course_id: simulateData.course_id,
      new_grade: simulateData.new_grade,
      semester_number: simulateData.semester_number
    }]);

    // Reset the form
    setSimulateData({
      course_id: '',
      new_grade: '',
      semester_number: 1
    });
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(prev => prev.filter(course => course.course_id !== courseId));
  };

  const handleGradeChange = (courseId: string, newGrade: string) => {
    setSelectedCourses(prev => prev.map(course => 
      course.course_id === courseId ? { ...course, new_grade: newGrade } : course
    ));
  };

  const handleSemesterChange = (courseId: string, newSemesterNumber: number) => {
    setSelectedCourses(prev => prev.map(course => 
      course.course_id === courseId ? { ...course, semester_number: newSemesterNumber } : course
    ));
  };

  const handleSimulateMultiple = async () => {
    if (!studentId || selectedCourses.length === 0) return;

    try {
      setSimulateLoading(true);
      // Only send course_id and new_grade to the backend
      const coursesForBackend = selectedCourses.map(({ course_id, new_grade }) => ({
        course_id,
        new_grade
      }));

      const response = await simulateRetake({
        student_id: studentId,
        courses: coursesForBackend
      });
      
      setSimulatedCgpa(response.data.simulated_cgpa);
      // Add semester information to simulation results for display
      const resultsWithSemester = response.data.simulation_results.map((result: Omit<SimulationResult, 'semester_number'>) => {
        const selectedCourse = selectedCourses.find(course => course.course_id === result.course_id);
        return {
          ...result,
          semester_number: selectedCourse?.semester_number || 1
        };
      });
      setSimulationResults(resultsWithSemester);
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
    shareText += `Simulated CGPA: ${typeof simulatedCgpa === 'number' ? simulatedCgpa.toFixed(2) : simulatedCgpa}\n\n`;

    // Group by semester
    const semesterGroups = simulationSemesterNumbers.map(semesterNumber => {
      const courses = simulationResultsBySemester[semesterNumber];
      let semesterText = `📚 Semester ${semesterNumber}\n`;
      courses.forEach(course => {
        semesterText += `${course.course_name}: ${course.new_grade} (${course.grade_points.toFixed(2)} points)\n`;
      });
      return semesterText;
    });

    return shareText + semesterGroups.join('\n');
  };

  const handleShare = async () => {
    const text = formatResultsForSharing();
    
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000); // Reset after 3 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const generatePDF = () => {
    if (!simulationResults.length || simulatedCgpa === null) return;

    setGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(44, 119, 244); // Primary blue color
      doc.text('Grade Simulation Results', 20, 20);
      
      // Add Student ID
      doc.setFontSize(14);
      doc.setTextColor(108, 117, 125); // Gray text color
      doc.text(`Student ID: ${studentId}`, 20, 30);
      
      // Add CGPA
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Simulated CGPA: ${typeof simulatedCgpa === 'number' ? simulatedCgpa.toFixed(2) : simulatedCgpa}`, 20, 45);

      let yPosition = 60; // Adjusted starting position to accommodate new student ID line
      
      // Add results by semester
      simulationSemesterNumbers.forEach((semesterNumber) => {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        // Add semester header
        doc.setFontSize(14);
        doc.setTextColor(33, 37, 41); // Dark text color
        doc.text(`Semester ${semesterNumber}`, 20, yPosition);
        yPosition += 10;

        // Add table headers
        doc.setFontSize(12);
        doc.setTextColor(108, 117, 125); // Gray text color
        doc.text('Course', 20, yPosition);
        doc.text('Grade', 120, yPosition);
        doc.text('Points', 150, yPosition);
        doc.text('Status', 180, yPosition);
        yPosition += 5;

        // Add horizontal line
        doc.setDrawColor(233, 236, 239); // Light gray color
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;

        // Add courses
        doc.setTextColor(0, 0, 0);
        simulationResultsBySemester[semesterNumber].forEach((result) => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          doc.text(result.course_name, 20, yPosition);
          doc.text(result.new_grade, 120, yPosition);
          doc.text(result.grade_points.toFixed(2), 150, yPosition);
          doc.text(result.is_new_course ? 'New Course' : 'Retake', 180, yPosition);
          yPosition += 10;
        });

        yPosition += 10;
      });

      // Add generation date at the bottom
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text(`Generated on: ${currentDate}`, 20, 280);

      // Save the PDF
      doc.save(`grade-simulation-results-${studentId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPDF(false);
    }
  };

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
        <div className='flex-grow-1'>
          <label className='form-label'>Semester</label>
          <select
            className='form-select form-select-solid'
            value={simulateData.semester_number}
            onChange={(e) => setSimulateData({ ...simulateData, semester_number: Number(e.target.value) })}
            disabled={!simulateData.course_id}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                Semester {num}
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
          <label className='form-label'>Selected Courses by Semester</label>
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
            ))}
          </div>
        </div>
      )}

      {simulatedCgpa !== null && (
        <div className='alert alert-info'>
          <div className='d-flex justify-content-between align-items-center'>
            <span className='fw-bold fs-3'>
              Simulated CGPA: {typeof simulatedCgpa === 'number' ? simulatedCgpa.toFixed(2) : simulatedCgpa}
            </span>
            <button
              className={`btn btn-sm ${generatingPDF ? 'btn-light disabled' : 'btn-primary'}`}
              onClick={generatePDF}
              disabled={generatingPDF}
            >
              <KTIcon iconName={generatingPDF ? 'file' : 'download'} className='fs-2 me-2' />
              {generatingPDF ? 'Generating PDF...' : 'Download PDF'}
            </button>
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
    </div>
  );
};

export default CourseSimulation; 