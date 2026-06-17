FROM node:20-alpine

WORKDIR /app

# Copy root configs and web package.json
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dev and production dependencies
RUN npm install --workspace=apps/web

# Copy actual code
COPY apps/web ./apps/web

# Disable telemetry and build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=apps/web

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=apps/web"]
