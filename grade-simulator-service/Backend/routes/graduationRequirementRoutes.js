const express = require('express');
const router = express.Router();
const graduationRequirementController = require('../controllers/graduationRequirementController');

router.get('/graduation-requirements', graduationRequirementController.getAllGraduationRequirements);
router.get('/graduation-requirements/:id', graduationRequirementController.getGraduationRequirementById);

module.exports = router;