// Import necessary modules
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

exports.getAllProgramPlans = async (req, res) => {
  try {
    const response = await axios.get(endpoints.programPlans);
    const plans = response.data;
    res.json(plans);
  } catch (err) {
    handleApiError(err, res);
  }
};

exports.getProgramPlanById = async (req, res) => {
  try {
    const response = await axios.get(`${endpoints.programPlans}/${req.params.id}`);
    const plan = response.data;

    if (!plan) {
      return res.status(404).json({ error: 'Program plan not found' });
    }

    res.json(plan);
  } catch (err) {
    handleApiError(err, res);
  }
};

exports.trackStudentProgramPlan = async (req, res) => {
  const { student_id } = req.params;

  try {
    // Fetch student
    const studentResponse = await axios.get(`${endpoints.students}/${student_id}`);
    const student = studentResponse.data;

    // Fetch student's program plan with courses and prerequisites
    const programPlansResponse = await axios.get(`${endpoints.programPlan(student.program_id)}/detailed`);
    const programPlans = programPlansResponse.data;

    // Fetch student's grades
    const gradesResponse = await axios.get(endpoints.studentGrades(student_id));
    const grades = gradesResponse.data;

    // Extract course IDs from the student's grades
    const takenCourses = grades.map(grade => ({
      course_id: grade.course_id,
      course_name: grade.course.name,
      credits: grade.course.credits,
      grade: grade.grade,
      percentage: grade.percentage,
      course_grade_points: grade.course_grade_points,
    }));

    const takenCourseIds = takenCourses.map(course => course.course_id);

    // Get all course IDs required by the student's program
    const requiredCourseIds = programPlans
      .filter(plan => plan.course_id)
      .map(plan => plan.course_id);

    // Filter out courses that the student has already taken
    const remainingCourseIds = requiredCourseIds.filter(id => !takenCourses.some(c => c.course_id === id));

    // Fetch remaining courses and check prerequisites
    const remainingCourses = await Promise.all(
      remainingCourseIds.map(async (courseId) => {
        const programPlan = programPlans.find(plan => plan.course_id === courseId);
        
        if (!programPlan || !programPlan.Course) {
          return null;
        }

        const course = programPlan.Course;
        const prerequisites = course.Prerequisites || [];
        let canTake = true;
        let prerequisiteStatus = 'Eligible';

        for (const prerequisite of prerequisites) {
          const prerequisiteGrade = grades.find(g => g.course_id === prerequisite.course_id);

          if (!prerequisiteGrade) {
            canTake = false;
            prerequisiteStatus = `Prerequisite ${prerequisite.name} not taken`;
            break;
          } else if (prerequisiteGrade.grade === 'F') {
            canTake = false;
            prerequisiteStatus = `Failed prerequisite: ${prerequisite.name}`;
            break;
          }
        }

        return {
          course_id: course.course_id,
          course_name: course.name,
          credits: course.credits,
          grade: null,
          percentage: null,
          course_grade_points: null,
          can_take: canTake,
          prerequisite_status: prerequisiteStatus,
        };
      })
    );

    res.json({
      student_id,
      program_id: student.program_id,
      taken_courses: takenCourses,
      remaining_courses: remainingCourses,
    });
  } catch (err) {
    handleApiError(err, res);
  }
};
