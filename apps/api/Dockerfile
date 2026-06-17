FROM node:20-alpine

WORKDIR /app

# Copy root configurations and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Copy api package json
COPY apps/api/package*.json ./apps/api/

# Install dependencies (root and api workspace)
RUN npm install --workspace=apps/api

# Generate Prisma Client
RUN npx prisma generate

# Copy application files
COPY apps/api ./apps/api

EXPOSE 5000

CMD ["npm", "run", "start", "--workspace=apps/api"]
