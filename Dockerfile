# Default: Deploy backend only (rename to Dockerfile.backend for backend deployment)
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm install --only=production

COPY backend .

EXPOSE 3000

CMD ["npm", "start"]
