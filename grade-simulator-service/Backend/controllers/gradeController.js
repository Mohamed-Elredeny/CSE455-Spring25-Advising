
const Grade = require('../models/Grade');
const Student = require('../models/Student');  // Missing import
const Course = require('../models/Course');    // Missing import
exports.getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.findAll({ include: [Course] });
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id, { include: [Course] });
    if (!grade) return res.status(404).json({ error: 'Grade not found' });
    res.json(grade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getGradesByStudentId = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    console.log('studentId:', studentId);
    const student = await Student.findByPk(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const grades = await Grade.findAll({
      where: { student_id: studentId },
      include: [{
        model: Course,
        as: 'course', // Changed to lowercase 'course' to match association
        attributes: ['course_id', 'name', 'credits']
      }],
      order: [['semester_id', 'ASC']]
    });

    res.json({
      student_id: studentId,
      student_name: student.name,
      grades
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: 'Server error while fetching grades',
      details: err.message 
    });
  }
};