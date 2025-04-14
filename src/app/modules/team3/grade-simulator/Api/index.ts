import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/simulator',
});

// Interfaces
interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface GpaRule {
  id: string;
  letter_grade: string;
  gpa_points: number;
  min_percentage: number;
  max_percentage: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
}

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  grade: string;
  semesterId: string;
}

interface ProgramPlan {
  id: string;
  name: string;
  requirements: string[];
}

interface GraduationRequirement {
  id: string;
  name: string;
  description: string;
  requiredCredits: number;
}

interface SimulationData {
  student_id: string;
  course_id?: string;
  new_grade?: string;
  courses?: Array<{
    course_id: string;
    new_grade: string;
  }>;
}

// Semester API
export const getSemesters = () => API.get<Semester[]>('/semesters');
export const getSemester = (id: string) => API.get<Semester>(`/semesters/${id}`);
export const createSemester = (data: Omit<Semester, 'id'>) => API.post<Semester>('/semesters', data);
export const updateSemester = (id: string, data: Partial<Semester>) => API.put<Semester>(`/semesters/${id}`, data);
export const deleteSemester = (id: string) => API.delete(`/semesters/${id}`);

// Student API
export const getStudents = () => API.get<Student[]>('/students');
export const getStudent = (id: string) => API.get<Student>(`/students/${id}`);
export const getStudentCourses = (id: string) => API.get<Grade[]>(`/students/${id}/grades`);
export const getStudentProgramCourses = (id: string) => API.get<Course[]>(`/students/${id}/program-courses`);
export const createStudent = (data: Omit<Student, 'id'>) => API.post<Student>('/students', data);
export const updateStudent = (id: string, data: Partial<Student>) => API.put<Student>(`/students/${id}`, data);
export const deleteStudent = (id: string) => API.delete(`/students/${id}`);

// GPA Rules API
export const getGpaRules = () => API.get<GpaRule[]>('/gpa-rules');
export const getGpaRule = (id: string) => API.get<GpaRule>(`/gpa-rules/${id}`);
export const createGpaRule = (data: Omit<GpaRule, 'id'>) => API.post<GpaRule>('/gpa-rules', data);
export const updateGpaRule = (id: string, data: Partial<GpaRule>) => API.put<GpaRule>(`/gpa-rules/${id}`, data);
export const deleteGpaRule = (id: string) => API.delete(`/gpa-rules/${id}`);

// Course API
export const getCourses = () => API.get<Course[]>('/courses');
export const getCourse = (id: string) => API.get<Course>(`/courses/${id}`);
export const createCourse = (data: Omit<Course, 'id'>) => API.post<Course>('/courses', data);
export const updateCourse = (id: string, data: Partial<Course>) => API.put<Course>(`/courses/${id}`, data);
export const deleteCourse = (id: string) => API.delete(`/courses/${id}`);

// Grade API
export const getGrades = () => API.get<Grade[]>('/grades');
export const getGrade = (id: string) => API.get<Grade>(`/grades/${id}`);
export const createGrade = (data: Omit<Grade, 'id'>) => API.post<Grade>('/grades', data);
export const updateGrade = (id: string, data: Partial<Grade>) => API.put<Grade>(`/grades/${id}`, data);
export const deleteGrade = (id: string) => API.delete(`/grades/${id}`);

// Program Plans API
export const getProgramPlans = () => API.get<ProgramPlan[]>('/programplans');
export const getProgramPlan = (id: string) => API.get<ProgramPlan>(`/programplans/${id}`);
export const createProgramPlan = (data: Omit<ProgramPlan, 'id'>) => API.post<ProgramPlan>('/programplans', data);
export const updateProgramPlan = (id: string, data: Partial<ProgramPlan>) => API.put<ProgramPlan>(`/programplans/${id}`, data);
export const deleteProgramPlan = (id: string) => API.delete(`/programplans/${id}`);

// Graduation Requirements API
export const getGraduationRequirements = () => API.get<GraduationRequirement[]>('/graduation-requirements');
export const getGraduationRequirement = (id: string) => API.get<GraduationRequirement>(`/graduation-requirements/${id}`);
export const createGraduationRequirement = (data: Omit<GraduationRequirement, 'id'>) => API.post<GraduationRequirement>('/graduation-requirements', data);
export const updateGraduationRequirement = (id: string, data: Partial<GraduationRequirement>) => API.put<GraduationRequirement>(`/graduation-requirements/${id}`, data);
export const deleteGraduationRequirement = (id: string) => API.delete(`/graduation-requirements/${id}`);

// GPA Calculations
export const calculateCGPA = (studentId: string) => API.get<{ cgpa: number }>(`/students/${studentId}/cgpa`);
export const simulateRetake = (data: SimulationData) => {
  // If courses array is provided, use it for multiple course simulation
  if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
    return API.post(`/students/${data.student_id}/simulate-retake`, {
      courses: data.courses
    });
  }
  // Otherwise, use single course simulation
  return API.post(`/students/${data.student_id}/simulate-retake`, {
    course_id: data.course_id,
    new_grade: data.new_grade
  });
};

// Graduation Status
export const checkGraduationStatus = (studentId: string) => API.get(`/students/${studentId}/graduation/`);

// Multiple Course Simulation
export const simulateMultipleCourses = (data: SimulationData) => API.post(`/students/${data.student_id}/simulate-multiple`, {
  courses: data.courses
});

// Default export for easy imports
const api = {
  getSemesters,
  getSemester,
  createSemester,
  updateSemester,
  deleteSemester,
  getStudents,
  getStudent,
  getStudentCourses,
  getStudentProgramCourses,
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
  checkGraduationStatus,
  simulateMultipleCourses
};

export default api; 