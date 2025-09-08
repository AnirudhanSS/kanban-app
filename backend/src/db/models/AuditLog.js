const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const AuditLog = sequelize.define('AuditLog', {
id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
board_id: { type: DataTypes.UUID, allowNull: true },
user_id: { type: DataTypes.UUID, allowNull: true },
entity_type: { type: DataTypes.STRING(50), allowNull: true },
entity_id: { type: DataTypes.UUID, allowNull: true },
action: { type: DataTypes.STRING(64), allowNull: false },
old_values: { type: DataTypes.JSONB, allowNull: true },
new_values: { type: DataTypes.JSONB, allowNull: true },
ip_address: { type: DataTypes.STRING, allowNull: true },
user_agent: { type: DataTypes.TEXT, allowNull: true },
created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
tableName: 'audit_logs',
timestamps: false,
indexes: [{ fields: ['board_id','created_at'] }]
});


module.exports = AuditLog;