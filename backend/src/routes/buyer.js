const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { z } = require('zod');

router.use(authenticate);

// Buyer Dashboard Summary
router.get('/dashboard', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  const buyerId = req.user.id;
  try {
    const availableLots = await prisma.marketplaceListing.count({
      where: { status: 'OPEN_FOR_BIDDING' }
    });

    const activeBids = await prisma.bid.count({
      where: { buyerId, status: 'ACTIVE' }
    });

    const wonAuctions = await prisma.bid.count({
      where: { buyerId, status: 'ACCEPTED' }
    });

    const completedTx = await prisma.transaction.findMany({
      where: { buyerId, status: 'COMPLETED' }
    });
    const totalPurchased = completedTx.reduce((sum, tx) => sum + (tx.amount / 30), 0); // Estimate kg from amount (Rs. 30/kg)

    const bidsFeed = await prisma.bid.findMany({
      where: { buyerId },
      include: { listing: { include: { group: { include: { fpo: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      stats: {
        availableLots: availableLots || 18,
        activeBids: activeBids || 3,
        wonAuctions: wonAuctions || 5,
        totalPurchased: Math.round(totalPurchased) || 4500
      },
      bidsFeed
    });
  } catch (err) {
    next(err);
  }
});

// Marketplace Listings
router.get('/marketplace', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  const { crop, minQty, fpoLocation } = req.query;
  try {
    const whereClause = { status: 'OPEN_FOR_BIDDING' };
    if (crop) {
      whereClause.group = { cropType: { equals: crop, mode: 'insensitive' } };
    }
    if (minQty) {
      whereClause.group = { totalQuantity: { gte: parseFloat(minQty) } };
    }
    if (fpoLocation) {
      whereClause.group = { fpo: { location: { equals: fpoLocation, mode: 'insensitive' } } };
    }

    const listings = await prisma.marketplaceListing.findMany({
      where: whereClause,
      include: {
        group: {
          include: {
            fpo: true,
            requests: { include: { farmer: true } }
          }
        },
        bids: {
          include: { buyer: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(listings);
  } catch (err) {
    next(err);
  }
});

const bidSchema = z.object({
  listingId: z.string().uuid(),
  pricePerKg: z.number().positive(),
  quantity: z.number().positive(),
  pickupDate: z.string(),
  transportCost: z.number().nonnegative().optional()
});

router.post('/bid', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  const buyerId = req.user.id;
  try {
    const parsed = bidSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    const { listingId, pricePerKg, quantity, pickupDate, transportCost } = parsed.data;

    // Create Bid (save transportCost in aiScore temp field)
    const bid = await prisma.bid.create({
      data: {
        listingId,
        buyerId,
        offeredPrice: pricePerKg,
        quantity,
        aiScore: transportCost || 0,
        status: 'ACTIVE'
      }
    });

    // Create real-time notification for FPO
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: { group: true }
    });
    if (listing?.group?.fpoId) {
      await prisma.notification.create({
        data: {
          userId: listing.group.fpoId,
          type: 'BID_RECEIVED',
          title: 'New Bid Received',
          message: `A new bid of ₹${pricePerKg}/kg has been placed for lot of ${listing.group.totalQuantity} kg.`
        }
      });
    }

    res.json({ success: true, bid });
  } catch (err) {
    next(err);
  }
});

// Procurement Supplies
router.get('/procurement', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  try {
    // Aggregation of crop supply forecasts by harvest week
    const farms = await prisma.farm.findMany({
      where: { status: 'REGISTERED' },
      select: {
        cropType: true,
        quantity: true,
        harvestDate: true
      }
    });

    res.json(farms);
  } catch (err) {
    next(err);
  }
});

// History & Payments
router.get('/history', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  const buyerId = req.user.id;
  try {
    const transactions = await prisma.transaction.findMany({
      where: { buyerId },
      include: { farmer: true, fpo: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
