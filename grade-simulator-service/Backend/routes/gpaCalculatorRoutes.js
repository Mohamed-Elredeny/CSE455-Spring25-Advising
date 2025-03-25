const express = require('express');
const router = express.Router();
const gpaCalculatorController = require('../controllers/gpaCalculatorController');

router.get('/students/:student_id/cgpa', gpaCalculatorController.calculateCGPA);
router.post('/students/:student_id/simulate-retake', gpaCalculatorController.simulateCourseRetake);
router.post('/students/:student_id/simulate-multiple', gpaCalculatorController.simulateMultipleCourses);
router.get('/students/:student_id/program-courses', gpaCalculatorController.getStudentProgramCourses);

module.exports = router;