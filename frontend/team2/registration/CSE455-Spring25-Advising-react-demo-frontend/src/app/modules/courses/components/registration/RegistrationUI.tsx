import React, { useState, useEffect } from 'react';

interface Course {
  course_id: string;
  title: string;
  instructor: string;
  credits: number;
  department: string;
  is_core: boolean;
  level: number;
}

const RegistrationUI: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [semester, setSemester] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch available courses from course-service catalog API
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses/catalog');
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          setError('Failed to load courses');
        }
      } catch (err) {
        setError('Error connecting to server');
      }
    };
    fetchCourses();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!studentId || !selectedCourseId || !semester) {
      setError('Please fill all fields');
      return;
    }
    try {
      const response = await fetch('/api/registrations/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          course_id: selectedCourseId,
          semester: semester
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessage('Registration successful!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  return (
    <div className="registration-ui">
      <h1>Course Registration</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label>Student ID:</label>
          <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
        </div>
        <div>
          <label>Course:</label>
          <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} required>
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_id} - {course.title} ({course.instructor})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Semester:</label>
          <input type="text" value={semester} onChange={(e) => setSemester(e.target.value)} required />
        </div>
        <button type="submit">Register</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default RegistrationUI;
