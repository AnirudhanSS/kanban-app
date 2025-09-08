// src/db/models/Notification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: true }, // allowNull true so we can SET NULL
  board_id: { type: DataTypes.UUID, allowNull: true },
  card_id: { type: DataTypes.UUID, allowNull: true },
  type: { type: DataTypes.STRING(64), allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: true },
  data: { type: DataTypes.JSONB, allowNull: true },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'notifications',
  timestamps: false,
  indexes: [{ fields: ['user_id','is_read'] }]
});
module.exports = Notification;
