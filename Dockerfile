# Stage 1: Build frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --omit=dev
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source code
COPY backend/ ./

# Copy frontend build to backend public folder
COPY --from=build-frontend /app/frontend/build ./public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["node", "src/server.js"]
