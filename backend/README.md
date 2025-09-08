kanban-collab/
├─ frontend/
│  └─ kanban-frontend/               # React app (created)
│     ├─ package.json
│     ├─ public/
│     └─ src/
│        ├─ index.js
│        ├─ App.js
│        ├─ components/
│        │  ├─ Board.js
│        │  ├─ Column.js
│        │  └─ Card.js
│        ├─ services/
│        │  ├─ api.js
│        │  └─ socket.js
│        └─ styles/
│           ├─ board.css
│           ├─ column.css
│           └─ card.css
│
└─ backend/
   ├─ package.json
   ├─ .env
   └─ src/
      ├─ config/
      │  └─ index.js                 # exports env-config
      │
      ├─ app.js                       # express setup (routes mounted)
      ├─ server.js                    # http server + socket.io + sync bootstrap
      │
      ├─ db/
      │  ├─ db.js                     # Sequelize instance (src/db/db.js)
      │  ├─ syncTables.js             # run to sync models (alter=true)
      │  ├─ associations.js           # associations (User,Board,Card,...)
      │  └─ models/
      │     ├─ User.js
      │     ├─ Board.js
      │     ├─ BoardMember.js
      │     ├─ Column.js
      │     ├─ Card.js
      │     ├─ Label.js
      │     ├─ CardLabel.js
      │     ├─ Notification.js
      │     └─ AuditLog.js
      │     └─ (optional Comment.js if you add it)
      │
      ├─ controllers/
      │  ├─ userController.js
      │  ├─ boardController.js
      │  ├─ columnController.js
      │  └─ cardController.js
      │
      ├─ routes/
      │  ├─ userRoutes.js
      │  ├─ boardRoutes.js
      │  ├─ columnRoutes.js
      │  └─ cardRoutes.js
      │
      ├─ middlewares/
      │  ├─ authMiddleware.js
      │  └─ errorHandler.js
      │
      ├─ services/
      │  ├─ socketAuth.js
      │  └─ redisClient.js
      │
      └─ (other helpers / utils)
