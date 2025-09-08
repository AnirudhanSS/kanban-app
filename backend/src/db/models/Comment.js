const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  card_id: { type: DataTypes.UUID, allowNull: false },
  user_id: { type: DataTypes.UUID, allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  parent_comment_id: { type: DataTypes.UUID, allowNull: true },
  is_edited: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'comments',
  timestamps: false
});

module.exports = Comment;
