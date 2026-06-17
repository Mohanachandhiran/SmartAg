const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://web:3000'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many requests, please try again after a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Import Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
app.locals.prisma = prisma;

// Setup mock Redis client fallback
let redisClient = {
  get: async () => null,
  set: async () => null,
  del: async () => null,
};

const setupRedis = async () => {
  if (process.env.REDIS_URL) {
    try {
      const redis = require('redis');
      const client = redis.createClient({ url: process.env.REDIS_URL });
      client.on('error', (err) => console.error('Redis Client Error', err));
      await client.connect();
      redisClient = client;
      console.log('Connected to Redis successfully');
    } catch (e) {
      console.warn('Redis is not running or failed to connect. Falling back to in-memory mock Redis.', e.message);
    }
  }
  app.locals.redis = redisClient;
};
setupRedis();

// Base Route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Route imports
const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmer');
const fpoRoutes = require('./routes/fpo');
const buyerRoutes = require('./routes/buyer');
const govRoutes = require('./routes/government');
const marketRoutes = require('./routes/market');
const agmarknetRoutes = require('./routes/mandi-analytics');
const weatherRoutes = require('./routes/weather');

app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/fpo', fpoRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/government', govRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/mandi-analytics', agmarknetRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiLimiter, require('./routes/ai'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`SmartAg API Server running on port ${PORT}`);
});
