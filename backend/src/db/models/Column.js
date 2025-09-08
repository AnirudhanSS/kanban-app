const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const Column = sequelize.define('Column', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
board_id: { type: DataTypes.UUID, allowNull: false },
title: { type: DataTypes.STRING(200), allowNull: false },
position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
color: { type: DataTypes.STRING(20), allowNull: true },
card_limit: { type: DataTypes.INTEGER, allowNull: true },
is_archived: { type: DataTypes.BOOLEAN, defaultValue: false },
version: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
tableName: 'columns',
timestamps: true,
indexes: [{ fields: ['board_id','position'] }]
});


module.exports = Column;