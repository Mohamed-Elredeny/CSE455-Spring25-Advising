const Sequelize = require('sequelize');

const sequelize = new Sequelize('simulator_db', 'root', '', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  logging: false, // Set to console.log for debugging if needed
});

module.exports = sequelize;