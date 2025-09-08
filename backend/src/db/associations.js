// src/db/associations.js
const User = require('./models/User');
const Board = require('./models/Board');
const BoardMember = require('./models/BoardMember');
const Column = require('./models/Column');
const Card = require('./models/Card');
const Label = require('./models/Label');
const CardLabel = require('./models/CardLabel');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const Comment = require('./models/Comment');

// owner: allow null if owner deleted
User.hasMany(Board, { foreignKey: 'owner_id' });
Board.belongsTo(User, { foreignKey: { name: 'owner_id', allowNull: true }, onDelete: 'SET NULL' });

// members
Board.hasMany(BoardMember, { foreignKey: 'board_id', onDelete: 'CASCADE' });
BoardMember.belongsTo(Board, { foreignKey: 'board_id' });
User.hasMany(BoardMember, { foreignKey: 'user_id', onDelete: 'CASCADE' });
BoardMember.belongsTo(User, { foreignKey: 'user_id' });

// columns/cards cascades
Board.hasMany(Column, { foreignKey: 'board_id', onDelete: 'CASCADE' });
Column.belongsTo(Board, { foreignKey: 'board_id' });
Column.hasMany(Card, { foreignKey: 'column_id', onDelete: 'CASCADE' });
Card.belongsTo(Column, { foreignKey: 'column_id' });

// card assignee/reporter: set null to preserve card
User.hasMany(Card, { foreignKey: 'assignee_id', as: 'assignedCards', onDelete: 'SET NULL' });
Card.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee', onDelete: 'SET NULL' });
User.hasMany(Card, { foreignKey: 'reporter_id', as: 'reportedCards', onDelete: 'SET NULL' });
Card.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter', onDelete: 'SET NULL' });

// labels
Board.hasMany(Label, { foreignKey: 'board_id', onDelete: 'CASCADE' });
Label.belongsTo(Board, { foreignKey: 'board_id' });

// card<->label
Card.belongsToMany(Label, { through: CardLabel, foreignKey: 'card_id', otherKey: 'label_id' });
Label.belongsToMany(Card, { through: CardLabel, foreignKey: 'label_id', otherKey: 'card_id' });

// Notifications: preserve when user deleted
User.hasMany(Notification, { foreignKey: 'user_id', onDelete: 'SET NULL' });
Notification.belongsTo(User, { foreignKey: { name: 'user_id', allowNull: true }, onDelete: 'SET NULL' });

// audit logs
Board.hasMany(AuditLog, { foreignKey: 'board_id', onDelete: 'CASCADE' });
AuditLog.belongsTo(Board, { foreignKey: 'board_id' });
User.hasMany(AuditLog, { foreignKey: 'user_id', onDelete: 'SET NULL' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', onDelete: 'SET NULL' });

// comments
Card.hasMany(Comment, { foreignKey: 'card_id', onDelete: 'CASCADE' });
Comment.belongsTo(Card, { foreignKey: 'card_id' });

User.hasMany(Comment, { foreignKey: 'user_id', onDelete: 'SET NULL' });
Comment.belongsTo(User, { foreignKey: 'user_id', onDelete: 'SET NULL' });

module.exports = { User, Board, BoardMember, Column, Card, Label, CardLabel, Notification, AuditLog, Comment };
