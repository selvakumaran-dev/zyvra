# Stage 1: Build the React Client
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build the Express Server
FROM node:18-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./

# Stage 3: Final Production Image
FROM node:18-alpine
WORKDIR /app

# Copy server files
COPY --from=server-build /app/server ./server
# Copy built client files to server's public directory (or serve separately)
# For this setup, we'll assume the server serves the static files or we use Nginx.
# Here we will just copy them to a 'public' folder in server to be served by Express
COPY --from=client-build /app/client/dist ./server/public

WORKDIR /app/server
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "src/app.js"]
