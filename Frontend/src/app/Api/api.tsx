import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Semester API
export const getSemesters = () => API.get('/semesters');
export const getSemester = (id) => API.get(`/semesters/${id}`);
export const createSemester = (data) => API.post('/semesters', data);
export const updateSemester = (id, data) => API.put(`/semesters/${id}`, data);
export const deleteSemester = (id) => API.delete(`/semesters/${id}`);

// Student API
export const getStudents = () => API.get('/students');
export const getStudent = (id) => API.get(`/students/${id}`);
export const getStudentCourses = (id) => API.get(`/students/${id}/grades`);
export const createStudent = (data) => API.post('/students', data);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent = (id) => API.delete(`/students/${id}`);

// GPA Rules API
export const getGpaRules = () => API.get('/gpa-rules');
export const getGpaRule = (id) => API.get(`/gpa-rules/${id}`);
export const createGpaRule = (data) => API.post('/gpa-rules', data);
export const updateGpaRule = (id, data) => API.put(`/gpa-rules/${id}`, data);
export const deleteGpaRule = (id) => API.delete(`/gpa-rules/${id}`);

// Course API
export const getCourses = () => API.get('/courses');
export const getCourse = (id) => API.get(`/courses/${id}`);
export const createCourse = (data) => API.post('/courses', data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);

// Grade API
export const getGrades = () => API.get('/grades');
export const getGrade = (id) => API.get(`/grades/${id}`);
export const createGrade = (data) => API.post('/grades', data);
export const updateGrade = (id, data) => API.put(`/grades/${id}`, data);
export const deleteGrade = (id) => API.delete(`/grades/${id}`);

// Program Plans API
export const getProgramPlans = () => API.get('/programplans');
export const getProgramPlan = (id) => API.get(`/programplans/${id}`);
export const createProgramPlan = (data) => API.post('/programplans', data);
export const updateProgramPlan = (id, data) => API.put(`/programplans/${id}`, data);
export const deleteProgramPlan = (id) => API.delete(`/programplans/${id}`);

// Graduation Requirements API
export const getGraduationRequirements = () => API.get('/graduation-requirements');
export const getGraduationRequirement = (id) => API.get(`/graduation-requirements/${id}`);
export const createGraduationRequirement = (data) => API.post('/graduation-requirements', data);
export const updateGraduationRequirement = (id, data) => API.put(`/graduation-requirements/${id}`, data);
export const deleteGraduationRequirement = (id) => API.delete(`/graduation-requirements/${id}`);

// GPA Calculations
export const calculateCGPA = (studentId) => API.get(`/students/${studentId}/cgpa`);
export const simulateRetake = (data) => API.post(`/students/${data.student_id}/simulate-retake`, {
  course_id: data.course_id,
  new_grade: data.new_grade
});

// Graduation Status
export const checkGraduationStatus = (studentId) => API.get(`/students/${studentId}/graduation/`);

// Default export for easy imports
const api = {
  getSemesters,
  getSemester,
  createSemester,
  updateSemester,
  deleteSemester,
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getGpaRules,
  getGpaRule,
  createGpaRule,
  updateGpaRule,
  deleteGpaRule,
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getProgramPlans,
  getProgramPlan,
  createProgramPlan,
  updateProgramPlan,
  deleteProgramPlan,
  getGraduationRequirements,
  getGraduationRequirement,
  createGraduationRequirement,
  updateGraduationRequirement,
  deleteGraduationRequirement,
  calculateCGPA,
  simulateRetake,
  checkGraduationStatus
};

export default api;