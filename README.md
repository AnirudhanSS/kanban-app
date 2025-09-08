# 🚀 Collaborative Kanban Board

A real-time collaborative Kanban board application built with React, Node.js, and WebSockets. Multiple users can work together on boards with live updates, presence indicators, and notifications.

## ✨ Features

### Core Features
- **📋 Board Management**: Create, edit, and manage Kanban boards with customizable columns
- **🎯 Card CRUD**: Create, update, delete, and assign cards with due dates and labels
- **🔄 Real-Time Collaboration**: Live updates across all connected users via WebSockets
- **👥 Presence Tracking**: See who's online and working on the board
- **🔔 Notifications**: In-app notifications for card assignments and mentions
- **📝 Audit Log**: Complete history of all board changes and events
- **🎨 Drag & Drop**: Smooth drag-and-drop functionality for cards and columns

### Advanced Features
- **🔐 User Authentication**: Secure JWT-based authentication system
- **👤 User Management**: Profile management and board member roles
- **🔍 Search & Filter**: Find cards and boards quickly
- **🌙 Dark/Light Theme**: Toggle between themes
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **⚡ Optimistic UI**: Instant feedback with conflict resolution
- **🛡️ Security**: Rate limiting, input validation, and secure headers

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Redux Toolkit** for state management
- **Styled Components** for styling
- **Socket.io Client** for real-time communication
- **React Beautiful DnD** for drag-and-drop

### Backend
- **Node.js** with Express
- **Socket.io** for WebSocket connections
- **Sequelize** ORM with PostgreSQL
- **JWT** for authentication
- **Redis** for presence tracking and caching
- **SendGrid** for email notifications

### Infrastructure
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **Render.com** for hosting
- **Supabase** for PostgreSQL database
- **Upstash** for Redis

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker (optional)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnirudhanSS/kanban-app.git
   cd kanban-app
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file
   cp backend/env.example backend/.env
   
   # Edit the .env file with your configuration
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t kanban-app .
   ```

2. **Run the container**
   ```bash
   docker run -p 5000:5000 --env-file backend/.env kanban-app
   ```

## 📊 Environment Variables

### Required Variables
```env
# Database
DB_HOST=your-supabase-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password

# Redis
REDIS_URL=your-upstash-redis-url

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Email
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=your-email@domain.com

# Server
PORT=5000
NODE_ENV=production
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Boards
- `GET /api/boards` - Get user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get board details
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Cards
- `GET /api/boards/:boardId/cards` - Get board cards
- `POST /api/boards/:boardId/cards` - Create new card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### WebSocket Events
- `join-board` - Join a board room
- `leave-board` - Leave a board room
- `card-created` - Card created event
- `card-updated` - Card updated event
- `card-moved` - Card moved event
- `card-deleted` - Card deleted event

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Health Check
```bash
curl http://localhost:5000/health
```

## 🚀 Deployment

### GitHub Actions CI/CD
The project includes automated CI/CD pipelines:

- **CI Pipeline**: Runs on every push/PR
  - Builds and tests the application
  - Security scanning
  - Docker image building
  - Code quality checks

- **Deploy Pipeline**: Runs on main branch pushes
  - Deploys to Render.com
  - Health checks
  - Keeps instance warm

### Manual Deployment to Render

1. **Connect GitHub repository** to Render
2. **Set environment variables** in Render dashboard
3. **Use the provided Dockerfile**
4. **Deploy automatically** on git push

## 📈 Performance Features

- **Optimistic UI Updates**: Instant feedback with server reconciliation
- **Connection Recovery**: Automatic reconnection on network issues
- **Presence Tracking**: Real-time user presence with Redis
- **Rate Limiting**: Prevents abuse and spam
- **Caching**: Redis caching for improved performance
- **Compression**: Gzip compression for faster loading

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Proper cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **Password Hashing**: bcrypt for secure password storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with external tools (Slack, GitHub)
- [ ] Advanced permission system
- [ ] Board templates
- [ ] Time tracking
- [ ] File attachments
- [ ] Advanced search and filtering

## 📞 Support

For support, email support@kanban-app.com or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- React team for the amazing framework
- Socket.io for real-time communication
- Supabase for the database infrastructure
- Render.com for hosting
- All contributors and testers

---

**Built with ❤️ for collaborative productivity**