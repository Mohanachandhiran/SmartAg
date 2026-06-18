const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'smartag_jwt_signing_secret_key_change_in_production';

/**
 * Middleware to authenticate requests. Supports actual JWT parsing
 * and a fallback ?demoRole=FARMER|FPO|BUYER|GOVERNMENT query param for testing purposes.
 */
const authenticate = async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  let userId = null;
  let userRole = null;
  let userName = null;

  // 1. Try to parse authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      // Decode JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.sub || decoded.id;
      userRole = decoded.role;
      userName = decoded.name;
    } catch (e) {
      console.warn('JWT Verification failed:', e.message);
    }
  }

  // 2. Fallback to demoRole query parameter for easier debugging and presentation
  if (!userId && req.query.demoRole) {
    const role = req.query.demoRole.toUpperCase();
    try {
      const dbUser = await prisma.user.findFirst({
        where: { role }
      });
      if (dbUser) {
        userId = dbUser.id;
        userRole = dbUser.role;
        userName = dbUser.name;
      }
    } catch (e) {
      console.error('Error fetching fallback demo user:', e.message);
    }
  }

  // If no auth was resolved and no demo param, try fallback to a generic user
  if (!userId) {
    // For demo convenience, load the first Farmer
    try {
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        userId = firstUser.id;
        userRole = firstUser.role;
        userName = firstUser.name;
      }
    } catch (err) {
      // DB not ready
    }
  }

  req.user = {
    id: userId,
    role: userRole,
    name: userName
  };

  next();
};

/**
 * Roles Guard Middleware
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: User authentication required' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Requires role: ${roles.join(' or ')}` });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
