const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semesterController');

router.get('/semesters', semesterController.getAllSemesters);
router.get('/semesters/:id', semesterController.getSemesterById);

module.exports = router;