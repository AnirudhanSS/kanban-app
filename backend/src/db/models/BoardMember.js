const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const BoardMember = sequelize.define('BoardMember', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
board_id: { type: DataTypes.UUID, allowNull: false },
user_id: { type: DataTypes.UUID, allowNull: false },
role: { type: DataTypes.ENUM('owner','admin','editor','viewer'), allowNull: false, defaultValue: 'editor' },
invited_by: { type: DataTypes.UUID, allowNull: true },
joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
tableName: 'board_members',
timestamps: false,
indexes: [{ unique: true, fields: ['board_id','user_id'] }]
});


module.exports = BoardMember;