# ========================================
# Frontend Dockerfile - Multi-stage Production Build
# React + Vite + Nginx optimized for Railway
# ========================================

# ========================================
# Build Stage
# ========================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_ENVIRONMENT=production

# Set build-time environment variables
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

# Build the application
RUN npm run build

# ========================================
# Production Stage with Nginx
# ========================================
FROM nginx:alpine AS production

# Copy the built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf.bak

# Expose port for Railway
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start nginx (as root - required for Railway)
CMD ["nginx", "-g", "daemon off;"]