const axios = require('axios');
const { endpoints } = require('../config/pythonApi');

// Helper function to handle API errors
const handleApiError = (err, res) => {
  console.error('API Error:', err);
  if (err.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return res.status(err.response.status).json(err.response.data);
  } else if (err.request) {
    // The request was made but no response was received
    return res.status(503).json({ 
      error: 'Python API service unavailable',
      details: err.message
    });
  } else {
    // Something happened in setting up the request that triggered an Error
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: err.message
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const response = await axios.get(endpoints.students);
    const students = response.data;
    res.json(students);
  } catch (err) {
    handleApiError(err, res);
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const response = await axios.get(`${endpoints.students}/${req.params.id}`);
    const student = response.data;
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    handleApiError(err, res);
  }
};

exports.getStudentProgramCourses = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch student
    const studentResponse = await axios.get(`${endpoints.students}/${id}`);
    const student = studentResponse.data;
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch program plan courses with course details
    const programPlansResponse = await axios.get(endpoints.programPlan(student.program_id));
    const programPlanCourses = programPlansResponse.data;

    // Fetch student's existing grades
    const gradesResponse = await axios.get(endpoints.studentGrades(id));
    const grades = gradesResponse.data;

    // Map program plan courses with grade information if available
    const courses = programPlanCourses.map(planCourse => {
      const existingGrade = grades.find(grade => grade.course_id === planCourse.course_id);
      return {
        course_id: planCourse.course_id,
        course_name: planCourse.Course.name,
        credits: planCourse.Course.credits,
        category: planCourse.category,
        current_grade: existingGrade ? existingGrade.grade : null,
        is_taken: !!existingGrade,
        grade_points: existingGrade ? existingGrade.course_grade_points : null,
        semester_id: existingGrade ? existingGrade.semester_id : null
      };
    });

    res.json({
      student_id: id,
      student_name: student.name,
      program_id: student.program_id,
      courses
    });
  } catch (err) {
    handleApiError(err, res);
  }
};

