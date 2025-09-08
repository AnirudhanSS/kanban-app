const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const Board = sequelize.define('Board', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
title: { type: DataTypes.STRING(255), allowNull: false },
description: { type: DataTypes.TEXT, allowNull: true },
owner_id: { type: DataTypes.UUID, allowNull: true },
background_color: { type: DataTypes.STRING(20), allowNull: true },
is_public: { type: DataTypes.BOOLEAN, defaultValue: false },
is_archived: { type: DataTypes.BOOLEAN, defaultValue: false },
version: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
tableName: 'boards',
timestamps: true,
});


module.exports = Board;