const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const gradeController = require('../controllers/gradeController');


router.get('/students', studentController.getAllStudents);
router.get('/students/:id', studentController.getStudentById);
router.get('/students/:studentId/grades', gradeController.getGradesByStudentId);
router.get('/students/:id/program-courses', studentController.getStudentProgramCourses);
module.exports = router;