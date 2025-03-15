const express = require('express');
const router = express.Router();
const graduationController = require('../controllers/graduationController');

router.get('/students/:student_id/graduation', graduationController.checkGraduationRequirements);

module.exports = router;