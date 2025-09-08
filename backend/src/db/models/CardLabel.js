const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const CardLabel = sequelize.define('CardLabel', {
card_id: { type: DataTypes.UUID, primaryKey: true },
label_id: { type: DataTypes.UUID, primaryKey: true },
created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
tableName: 'card_labels',
timestamps: false
});


module.exports = CardLabel;