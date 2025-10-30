# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for ts-node seed script)
RUN npm ci

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy source files for seed script (needed for ts-node)
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./

# Copy seed data CSV file
COPY src/scripts/rhfd_riders.csv ./src/scripts/

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"]

