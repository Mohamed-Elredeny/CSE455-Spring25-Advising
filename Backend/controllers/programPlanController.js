// Import necessary modules and models
const { Op } = require('sequelize');
const ProgramPlan = require('../models/ProgramPlan');
const Course = require('../models/Course');
const Grade = require('../models/Grade');
const Student = require('../models/Student');

exports.getAllProgramPlans = async (req, res) => {
  try {
    const plans = await ProgramPlan.findAll({
      include: [
        {
          model: Course,
          as: 'Course', // Ensuring we use the correct alias
          include: [{ model: Course, as: 'Prerequisites' }],
        },
      ],
    });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProgramPlanById = async (req, res) => {
  try {
    const plan = await ProgramPlan.findByPk(req.params.id, {
      include: [
        {
          model: Course,
          as: 'Course', // Ensure 'as' alias is used correctly
          include: [{ model: Course, as: 'Prerequisites' }],
        },
      ],
    });

    if (!plan) {
      return res.status(404).json({ error: 'Program plan not found' });
    }

    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.trackStudentProgramPlan = async (req, res) => {
  const { student_id } = req.params;

  try {
    // Fetch student
    const student = await Student.findByPk(student_id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Fetch student's program plan with courses and prerequisites
    const programPlans = await ProgramPlan.findAll({
      where: { program_id: student.program_id },
      include: [
        {
          model: Course,
          as: 'Course', // ✅ Ensure this matches association alias
          include: [{ model: Course, as: 'Prerequisites' }], // ✅ Ensuring correct alias for prerequisites
        },
      ],
    });

    // Fetch student's grades
    const grades = await Grade.findAll({
      where: { student_id },
      include: [{ model: Course, as: 'Course' }],
    });

    // Extract course IDs from the student's grades
    const takenCourses = grades.map(grade => ({
      course_id: grade.course_id,
      course_name: grade.Course.name,
      credits: grade.Course.credits,
      grade: grade.grade,
      percentage: grade.percentage,
      course_grade_points: grade.course_grade_points,
    }));

    const takenCourseIds = takenCourses.map(course => course.course_id);

    // Get all course IDs required by the student's program
    const requiredCourseIds = programPlans
      .filter(plan => plan.course_id)
      .map(plan => plan.course_id);

    // Filter out courses that the student has already taken
    const remainingCourseIds = requiredCourseIds.filter(id => !takenCourses.some(c => c.course_id === id));

    // Fetch remaining courses and check prerequisites
    const remainingCourses = await Promise.all(
      remainingCourseIds.map(async (courseId) => {
        const programPlan = programPlans.find(plan => plan.course_id === courseId);
        
        if (!programPlan || !programPlan.Course) {
          return null;
        }

        const course = programPlan.Course;
        const prerequisites = course.Prerequisites || [];
        let canTake = true;
        let prerequisiteStatus = 'Eligible';

        for (const prerequisite of prerequisites) {
          const prerequisiteGrade = grades.find(g => g.course_id === prerequisite.course_id);

          if (!prerequisiteGrade) {
            canTake = false;
            prerequisiteStatus = `Prerequisite ${prerequisite.name} not taken`;
            break;
          } else if (prerequisiteGrade.grade === 'F') {
            canTake = false;
            prerequisiteStatus = `Failed prerequisite: ${prerequisite.name}`;
            break;
          }
        }

        return {
          course_id: course.course_id,
          course_name: course.name,
          credits: course.credits,
          grade: null,
          percentage: null,
          course_grade_points: null,
          can_take: canTake,
          prerequisite_status: prerequisiteStatus,
        };
      })
    );

    res.json({
      student_id,
      program_id: student.program_id,
      taken_courses: takenCourses,
      remaining_courses: remainingCourses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
