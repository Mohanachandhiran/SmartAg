FROM node:20-alpine

WORKDIR /app

# Copy package configurations and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy application files
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
