const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const GPARule = sequelize.define('GPA_Rules', {
  rule_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  letter_grade: {
    type: Sequelize.STRING(2),
    allowNull: false,
    unique: true,
  },
  gpa_points: {
    type: Sequelize.DECIMAL(3, 1),
    allowNull: false,
  },
  min_percentage: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  max_percentage: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'GPA_Rules',
});

module.exports = GPARule;