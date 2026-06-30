# Use the official Node.js 22 LTS Alpine image for a small footprint
FROM node:22-alpine AS builder

# Create app directory
WORKDIR /app

# Install dependencies first (leverage Docker cache)
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# --- Production Image ---
FROM node:22-alpine

WORKDIR /app

# Copy node_modules and source code from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package.json ./

# Ensure logs and uploads directories exist with proper permissions
RUN mkdir -p logs uploads && chown -R node:node /app

# Switch to non-root user for security
USER node

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
