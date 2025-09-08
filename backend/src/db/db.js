// backend/src/db/db.js
const { Sequelize } = require('sequelize');
const cfg = require('../config');

// Check if we're connecting to Supabase (which requires SSL) or local database
const isSupabase = cfg.DB.DB_HOST && cfg.DB.DB_HOST.includes('supabase.co');

const sequelize = new Sequelize(
  cfg.DB.DB_NAME,
  cfg.DB.DB_USER,
  cfg.DB.DB_PASSWORD,
  {
    host: cfg.DB.DB_HOST,
    port: cfg.DB.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: isSupabase ? {
      // Supabase requires SSL
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {
      // Local database doesn't need SSL
      ssl: false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
