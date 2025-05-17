const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/students', studentController.getAllStudents);
router.get('/students/:id', studentController.getStudentById);
router.get('/students/:id/program-courses', studentController.getStudentProgramCourses);
module.exports = router;