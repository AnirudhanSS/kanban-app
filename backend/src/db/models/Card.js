// src/db/models/Card.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Card = sequelize.define('Card', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  column_id: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  assignee_id: { type: DataTypes.UUID, allowNull: true },
  reporter_id: { type: DataTypes.UUID, allowNull: true },
  due_date: { type: DataTypes.DATE, allowNull: true },
  priority: { type: DataTypes.ENUM('low','medium','high','urgent'), allowNull: true },
  position: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 1000 }, // use BIGINT for gaps
  estimated_hours: { type: DataTypes.DECIMAL(6,2), allowNull: true },
  actual_hours: { type: DataTypes.DECIMAL(6,2), allowNull: true },
  is_archived: { type: DataTypes.BOOLEAN, defaultValue: false },
  version: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'cards',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['column_id','position'] }, // prevent dup positions
    { fields: ['column_id','position'] },
    { fields: ['assignee_id'] }
  ]
});
module.exports = Card;
