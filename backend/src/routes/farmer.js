const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { z } = require('zod');
const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_API_URL || 'http://localhost:8000';

router.use(authenticate);

// Farmer Dashboard Summary
router.get('/dashboard', async (req, res, next) => {
  const prisma = require('../prisma');
  const farmerId = req.user.id;

  try {
    const farmer = await prisma.user.findUnique({ where: { id: farmerId } });
    
    // Count crop requests
    const cropRequests = await prisma.cropRequest.findMany({
      where: { farmerId }
    });

    const activeRequests = cropRequests.length;
    const expectedIncome = cropRequests.reduce((sum, req) => sum + (req.quantity * 25), 0);

    const transactions = await prisma.transaction.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      farmerName: farmer?.name || 'Farmer',
      expectedIncome,
      activeRequests,
      recentTransactions: transactions,
      marketAlert: null,
      weatherAlert: null,
      notifications: []
    });
  } catch (err) {
    next(err);
  }
});

const registerCropSchema = z.object({
  cropType: z.string().min(1),
  quantity: z.number().positive(),
  qualityGrade: z.string().length(1),
  harvestDate: z.string(),
  location: z.string().optional()
});

// POST /api/farmer/crops
router.post('/crops', async (req, res, next) => {
  const prisma = require('../prisma');
  const farmerId = req.user.id;
  try {
    const parsed = registerCropSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    // Ensure farmer exists in the real DB (handles old mock JWTs)
    if (!farmerId) {
      return res.status(401).json({ error: "Session expired or invalid user. Please log out and log in again." });
    }
    const farmerExists = await prisma.user.findUnique({ where: { id: farmerId } });
    if (!farmerExists) {
      return res.status(401).json({ error: "Session expired or invalid user. Please log out and log in again." });
    }

    const { cropType, quantity, qualityGrade, harvestDate, location } = parsed.data;

    const cropReq = await prisma.cropRequest.create({
      data: {
        farmerId,
        cropType,
        quantity,
        qualityGrade,
        harvestDate: new Date(harvestDate),
        location,
        status: 'PENDING_ANALYSIS'
      }
    });

    // Fetch localized Weather Risk Score before asking AI
    let weatherRisk = 'Medium'; // Default
    try {
      // Use Madurai default coords for demo if location isn't GPS
      const wRes = await axios.get(`http://localhost:${process.env.PORT || 5000}/api/weather?lat=9.9252&lng=78.1198`);
      if (wRes.data && wRes.data.riskScore) {
        weatherRisk = wRes.data.riskScore;
      }
    } catch (e) {
      console.warn('Weather service call failed during AI generation.');
    }

    // Call AI Service (Simulate if python microservice fails)
    let aiRec = null;
    try {
      const response = await axios.post(`${FASTAPI_URL}/ai/selling-recommendation`, {
        crop: cropType,
        quantity,
        location: location,
        weatherRisk: weatherRisk
      });
      aiRec = response.data;
    } catch (e) {
      console.warn('AI microservice unavailable, using generated mock.');
      aiRec = {
        sellToday: weatherRisk === 'High' ? 26.5 : 25.5,
        sellLater: weatherRisk === 'High' ? 24.0 : 28.0,
        joinFPO: 32.2,
        recommended: weatherRisk === 'High' ? 'SELL_MANDI_TODAY' : 'JOIN_FPO',
        confidence: 88,
        risk: weatherRisk,
        explanation: weatherRisk === 'High' 
          ? `High weather risk (${weatherRisk}) detected! Spoiling risk is elevated. AI recommends selling at the Mandi today.` 
          : 'FPO Collective grouping will reduce your logistics costs and fetch ~23% higher returns.'
      };
    }

    // Advance status to ANALYZED
    const updatedCropReq = await prisma.cropRequest.update({
      where: { id: cropReq.id },
      data: { status: 'ANALYZED' }
    });

    res.json({ request: updatedCropReq, recommendation: aiRec });
  } catch (err) {
    next(err);
  }
});

// Farmer Action to Choose Option
router.post('/crops/:id/decision', async (req, res, next) => {
  const prisma = require('../prisma');
  const farmerId = req.user.id;
  const { decision } = req.body; // 'SELL_TODAY', 'SELL_LATER', 'JOIN_COLLECTIVE'
  
  try {
    let newStatus = 'ANALYZED';
    if (decision === 'SELL_TODAY') newStatus = 'SELL_TODAY_CHOSEN';
    if (decision === 'SELL_LATER') newStatus = 'WAITING_FOR_SELL_DATE';
    if (decision === 'JOIN_COLLECTIVE') newStatus = 'WAITING_FOR_FPO';

    const updated = await prisma.cropRequest.update({
      where: { id: req.params.id },
      data: { status: newStatus }
    });

    res.json({ success: true, request: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/farmer/crops
router.get('/crops', async (req, res, next) => {
  const prisma = require('../prisma');
  const farmerId = req.user.id;
  try {
    const requests = await prisma.cropRequest.findMany({
      where: { farmerId },
      include: {
        group: {
          include: {
            fpo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
