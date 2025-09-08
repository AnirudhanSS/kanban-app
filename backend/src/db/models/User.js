// src/db/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING(320), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: true },
  first_name: { type: DataTypes.STRING(100), allowNull: false },
  last_name: { type: DataTypes.STRING(100), allowNull: true },
  avatar_url: { type: DataTypes.TEXT, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false } // new
}, {
  tableName: 'users',
  timestamps: true,
  defaultScope: {
    where: { is_deleted: false }
  },
  scopes: {
    withDeleted: {} // fetch everything when explicitly called
  }
});
module.exports = User;
