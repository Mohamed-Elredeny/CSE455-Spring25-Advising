const express = require('express');
const router = express.Router();
const gpaCalculatorController = require('../controllers/gpaCalculatorController');

router.get('/students/:student_id/cgpa', gpaCalculatorController.calculateCGPA);
router.post('/students/:student_id/simulate-retake', gpaCalculatorController.simulateCourseRetake);

module.exports = router;