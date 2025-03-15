const express = require('express');
const router = express.Router();
const gpaRuleController = require('../controllers/gpaRuleController');

router.get('/gpa-rules', gpaRuleController.getAllGPARules);
router.get('/gpa-rules/:grade', gpaRuleController.getGPARuleByGrade);

module.exports = router;