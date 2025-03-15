const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const GraduationRequirement = sequelize.define('Graduation_Requirements', {
  program_id: {
    type: Sequelize.STRING(10),
    primaryKey: true,
  },
  min_gpa: {
    type: Sequelize.DECIMAL(3, 1),
    allowNull: false,
  },
  min_credits: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'Graduation_Requirements',
});

module.exports = GraduationRequirement;