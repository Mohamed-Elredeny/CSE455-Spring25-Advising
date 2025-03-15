const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./Student');
const Course = require('./Course');
const Semester = require('./Semester');
const GPARule = require('./GPARule');

const Grade = sequelize.define('Grades', {
  grade_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  student_id: {
    type: Sequelize.STRING(10),
    allowNull: false,
    references: {
      model: Student,
      key: 'student_id',
    },
  },
  course_id: {
    type: Sequelize.STRING(10),
    allowNull: false,
    references: {
      model: Course,
      key: 'course_id',
    },
  },
  semester_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Semester,
      key: 'semester_id',
    },
  },
  grade: {
    type: Sequelize.STRING(2),
    defaultValue: null,
  },
  percentage: {
    type: Sequelize.INTEGER,
    defaultValue: null,
  },
  course_grade_points: {
    type: Sequelize.DECIMAL(4, 1),
    defaultValue: null,
  },
}, {
  timestamps: false,
  tableName: 'Grades',
  hooks: {
    beforeCreate: async (grade, options) => {
      if (grade.grade) {
        const gpaRule = await GPARule.findOne({ where: { letter_grade: grade.grade } });
        if (!gpaRule) throw new Error('Invalid grade: No matching GPA rule found');

        const course = await Course.findByPk(grade.course_id);
        if (!course) throw new Error('Course not found');

        grade.course_grade_points = (gpaRule.gpa_points * course.credits).toFixed(1);
      }
    },
    beforeUpdate: async (grade, options) => {
      if (grade.changed('grade')) {
        const gpaRule = await GPARule.findOne({ where: { letter_grade: grade.grade } });
        if (!gpaRule) throw new Error('Invalid grade: No matching GPA rule found');

        const course = await Course.findByPk(grade.course_id);
        if (!course) throw new Error('Course not found');

        grade.course_grade_points = (gpaRule.gpa_points * course.credits).toFixed(1);
      }
    },
  },
});

module.exports = Grade;