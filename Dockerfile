# Root Dockerfile for Dockploy deployment
# Uses docker-compose to orchestrate all services

FROM docker:24-dind

# Install docker-compose
RUN apk add --no-cache docker-compose

WORKDIR /app

# Copy configuration files
COPY docker-compose.yml .
COPY .env.docker .env

# Copy service code
COPY backend ./backend
COPY frontend ./frontend

# Expose ports
EXPOSE 3000 5173

# Start services
CMD ["docker-compose", "up"]
