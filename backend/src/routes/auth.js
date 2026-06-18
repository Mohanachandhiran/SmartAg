const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'smartag_jwt_signing_secret_key_change_in_production';

const loginSchema = z.object({
  name: z.string().min(2),
  password: z.string().min(4),
  role: z.string().optional()
});

router.post('/register', async (req, res, next) => {
  const prisma = require('../prisma');
  try {
    const { name, password, role } = req.body;
    
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password required' });
    }

    const existing = await prisma.user.findFirst({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        passwordHash: password, // Note: Use bcrypt in production
        role: role || 'FARMER'
      }
    });

    res.json({ message: 'Registration successful', userId: user.id });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  const prisma = require('../prisma');
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input format.' });
    }

    const { name, password, role } = parsed.data;

    const user = await prisma.user.findFirst({
      where: { name }
    });

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid name or password.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ error: `Account mismatch. Please log in via the ${user.role} portal.` });
    }

    const token = jwt.sign(
      { 
        sub: user.id, 
        role: user.role, 
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (err) {
    next(err);
  }
});

// GET profile endpoint
router.get('/session', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
