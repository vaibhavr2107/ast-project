# Stage 1: Build the frontend
FROM node:14 as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend
FROM node:14 as backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Stage 3: Final stage
FROM node:14
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend ./backend
# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Install production dependencies
WORKDIR /app/backend
RUN npm install --only=production

# Install serve to serve frontend
RUN npm install -g serve

# Expose ports
EXPOSE 3000 4000

# Start both frontend and backend
CMD ["sh", "-c", "serve -s ../frontend/build -l 3000 & node server.js"]