// src/db/syncTables.js
const sequelize = require('./db');
// require models to register them with sequelize
require('./models/User');
require('./models/Board');
require('./models/BoardMember');
require('./models/Column');
require('./models/Card');
require('./models/Label');
require('./models/CardLabel');
require('./models/Notification');
require('./models/AuditLog');
require('./associations');


(async () => {
try {
console.log('Authenticating DB...');
await sequelize.authenticate();
console.log('DB authenticated. Syncing...');
await sequelize.sync({ alter: true });
console.log('✅ DB synced (models created/updated)');
process.exit(0);
} catch (err) {
console.error('Sync error', err);
process.exit(1);
}
})();
