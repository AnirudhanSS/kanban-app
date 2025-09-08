const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const Label = sequelize.define('Label', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
board_id: { type: DataTypes.UUID, allowNull: false },
name: { type: DataTypes.STRING(100), allowNull: false },
color: { type: DataTypes.STRING(20), allowNull: true },
created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
tableName: 'labels',
timestamps: false
});


module.exports = Label;