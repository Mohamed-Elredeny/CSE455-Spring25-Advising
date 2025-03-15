const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Course = require('./Course');

const ProgramPlan = sequelize.define('Program_Plans', {
  plan_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  program_id: {
    type: Sequelize.STRING(10),
    allowNull: false,
  },
  course_id: {
    type: Sequelize.STRING(10),
    allowNull: true,
  },
  category: {
    type: Sequelize.STRING(50),
    allowNull: true,
  },
}, {
  timestamps: false,
  tableName: 'Program_Plans',
});

module.exports = ProgramPlan;