const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');

router.get('/grades', gradeController.getAllGrades);
router.get('/grades/:id', gradeController.getGradeById);

module.exports = router;