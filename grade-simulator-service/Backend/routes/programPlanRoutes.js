const express = require('express');
const router = express.Router();
const programPlanController = require('../controllers/programPlanController');

router.get('/programplans', programPlanController.getAllProgramPlans);
router.get('/programplans/:id', programPlanController.getProgramPlanById);
router.get('/students/:student_id/programplan', programPlanController.trackStudentProgramPlan);

module.exports = router;