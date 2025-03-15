const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Semester = sequelize.define('Semesters', {
  semester_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  semester_name: {
    type: Sequelize.STRING(15),
    allowNull: false,
    unique: true,
  },
  academic_year: {
    type: Sequelize.STRING(9),
    allowNull: false,
  },
  start_date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'Semesters',
});

module.exports = Semester;