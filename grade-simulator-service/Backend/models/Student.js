const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Students', {
  student_id: {
    type: Sequelize.STRING(10),
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  program_id: {
    type: Sequelize.STRING(10),
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'Students',
});

module.exports = Student;