const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const ProgramPlan = require('../models/ProgramPlan');

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentProgramCourses = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch student
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch program plan courses with course details
    const programPlanCourses = await ProgramPlan.findAll({
      where: { program_id: student.program_id },
      include: [{
        model: Course,
        as: 'course',
        required: true
      }]
    });

    // Fetch student's existing grades
    const grades = await Grade.findAll({
      where: { student_id: id },
      include: [{ model: Course, as: 'course' }]
    });

    // Map program plan courses with grade information if available
    const courses = programPlanCourses.map(planCourse => {
      const existingGrade = grades.find(grade => grade.course_id === planCourse.course_id);
      return {
        course_id: planCourse.course_id,
        course_name: planCourse.course.name,
        credits: planCourse.course.credits,
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
    console.error('Error in getStudentProgramCourses:', err);
    res.status(500).json({ error: err.message });
  }
};

