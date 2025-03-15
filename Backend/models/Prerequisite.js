
// models/Prerequisite.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Course = require('./Course');
const Prerequisite = sequelize.define('CoursePrerequisite', {
  course_id: {
    type: Sequelize.STRING(10),
    primaryKey: true
  },
  prerequisite_course_id: {
    type: Sequelize.STRING(10),
    primaryKey: true
  }
}, {
  timestamps: false, // Disable automatic timestamps
  tableName: 'CoursePrerequisites'
});

module.exports = Prerequisite;