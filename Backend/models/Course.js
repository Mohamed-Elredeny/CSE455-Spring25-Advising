// models/Course.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Courses', {
  course_id: {
    type: Sequelize.STRING(10),
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  credits: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  category: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'Courses',
});

module.exports = Course;