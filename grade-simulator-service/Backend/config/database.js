const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'simulator_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'mysql', // Updated to match the Kubernetes service name
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Set to console.log for debugging if needed
    retry: {
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /TimeoutError/,
      ],
      max: 5,
      backoffBase: 1000,
      backoffExponent: 1.5,
    }
  }
);

module.exports = sequelize;