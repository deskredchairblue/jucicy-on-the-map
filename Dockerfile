# Stage 1: Build the application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json tsconfig.json ./
# If using package-lock.json, include it:
COPY package-lock.json ./
RUN npm ci

# Copy source files and build the project
COPY src ./src
RUN npm run build

# Stage 2: Create the runtime image
FROM node:18-alpine

WORKDIR /app

# Copy production files from the build stage
COPY package.json ./
COPY --from=build /app/dist ./dist
COPY .env ./

# Install only production dependencies
RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "dist/server.js"]
