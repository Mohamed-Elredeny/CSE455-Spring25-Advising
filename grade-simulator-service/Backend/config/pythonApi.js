const PYTHON_API_BASE_URL = process.env.PYTHON_API_BASE_URL || 'http://localhost:5002/api';

module.exports = {
  PYTHON_API_BASE_URL,
  endpoints: {
    students: `${PYTHON_API_BASE_URL}/students`,
    studentGrades: (studentId) => `${PYTHON_API_BASE_URL}/students/${studentId}/grades`,
    courses: `${PYTHON_API_BASE_URL}/courses`,
    course: (courseId) => `${PYTHON_API_BASE_URL}/courses/${courseId}`,
    gpaRules: `${PYTHON_API_BASE_URL}/gpa-rules`,
    gpaRule: (letterGrade) => `${PYTHON_API_BASE_URL}/gpa-rules/${letterGrade}`,
    programPlans: `${PYTHON_API_BASE_URL}/program-plans`,
    programPlan: (programId) => `${PYTHON_API_BASE_URL}/program-plans/${programId}`,
    programPlanDetailed: (programId) => `${PYTHON_API_BASE_URL}/program-plans/${programId}/detailed`,
    semesters: `${PYTHON_API_BASE_URL}/semesters`,
    semester: (semesterId) => `${PYTHON_API_BASE_URL}/semesters/${semesterId}`,
    graduationRequirements: `${PYTHON_API_BASE_URL}/graduation-requirements`,
    graduationRequirement: (programId) => `${PYTHON_API_BASE_URL}/graduation-requirements/${programId}`,
  }
}; 