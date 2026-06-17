const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_API_URL || 'http://localhost:8000';

router.use(authenticate);

// Government Command Center stats
router.get('/command-center', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  try {
    const districtsCount = 4; // Madurai, Salem, Coimbatore, Dindigul
    const fposCount = await prisma.user.count({ where: { role: 'FPO' } });
    const farmersCount = await prisma.user.count({ where: { role: 'FARMER' } });
    
    // Total crop movement in tonnes (all grouped or sold crop volumes)
    const farmsVolume = await prisma.farm.aggregate({
      _sum: { quantity: true }
    });
    const totalVolumeTonnes = Math.round((farmsVolume._sum.quantity || 0) / 1000);

    // District-wise statistics
    const districtsData = [
      { district: 'Madurai', supplyVolume: 12400, priceStability: 88, riskLevel: 'Low', crop: 'Tomato' },
      { district: 'Salem', supplyVolume: 8900, priceStability: 75, riskLevel: 'Medium', crop: 'Onion' },
      { district: 'Coimbatore', supplyVolume: 15100, priceStability: 91, riskLevel: 'Low', crop: 'Banana' },
      { district: 'Dindigul', supplyVolume: 6700, priceStability: 62, riskLevel: 'High', crop: 'Chilli' }
    ];

    // Live alert ticker
    const alerts = await prisma.weatherAlert.findMany({
      orderBy: { validUntil: 'asc' },
      take: 5
    });

    res.json({
      kpis: {
        districtsMonitored: districtsCount,
        activeFPOs: fposCount,
        totalFarmers: farmersCount,
        cropMovementTonnes: totalVolumeTonnes
      },
      districtsData,
      liveAlerts: alerts
    });
  } catch (err) {
    next(err);
  }
});

// Supply index drill-down
router.get('/supply-index', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  try {
    const indices = [
      { district: 'Madurai', score: 85, trend: 'up', tomato: 90, coconut: 80 },
      { district: 'Salem', score: 72, trend: 'down', onion: 60, turmeric: 84 },
      { district: 'Coimbatore', score: 92, trend: 'stable', banana: 95, rice: 89 },
      { district: 'Dindigul', score: 68, trend: 'down', chilli: 55, tomato: 81 }
    ];
    res.json(indices);
  } catch (err) {
    next(err);
  }
});

// Risk Matrix combining weather, shortage, oversupply, price crash
router.get('/risk-monitoring', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  try {
    // Generate risk details or call Python Risk Engine
    const matrix = [
      { district: 'Madurai', weather: 'High', shortage: 'Low', oversupply: 'Low', priceCrash: 'Medium' },
      { district: 'Salem', weather: 'Medium', shortage: 'Medium', oversupply: 'Low', priceCrash: 'High' },
      { district: 'Coimbatore', weather: 'Low', shortage: 'Low', oversupply: 'Medium', priceCrash: 'Low' },
      { district: 'Dindigul', weather: 'Medium', shortage: 'High', oversupply: 'Low', priceCrash: 'High' }
    ];
    res.json(matrix);
  } catch (err) {
    next(err);
  }
});

// FPO Performance analysis
router.get('/fpo-analytics', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  try {
    const fpos = await prisma.user.findMany({
      where: { role: 'FPO' }
    });

    const performance = fpos.map((fpo, idx) => ({
      id: fpo.id,
      name: fpo.name,
      district: fpo.location,
      activeFarmers: 120 + idx * 35,
      revenue: 250000 + idx * 75000,
      cropMovement: 45 + idx * 12
    }));

    res.json(performance);
  } catch (err) {
    next(err);
  }
});

// Policy Insights from Gemini API
router.get('/policy-insights', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  try {
    let brief = "";
    
    // Attempt to call voice-chat/gemini API or compile local brief
    try {
      const response = await axios.post(`${FASTAPI_URL}/ai/voice-chat`, {
        message: "Generate a weekly agricultural policy brief for Tamil Nadu command center, focusing on tomato and onion pricing stability.",
        language: "English",
        context: "Government administration dashboard"
      });
      brief = response.data.response_text;
    } catch (e) {
      brief = "### Weekly Policy Brief\n\n**1. Tomato Price Stabilization:** Due to heavy rain forecasts in Madurai, a supply disruption is anticipated over the next week. Pre-emptive sourcing from Oddanchatram FPOs is recommended to cover Chennai market deficit.\n\n**2. Onion Shortage Mitigation:** Salem region reports a 15% drop in onion arrivals. FPOs should be encouraged to utilize storage warehouses instead of immediate mandi sales. Priority tag: High Intervention.";
    }

    const interventions = [
      { id: 1, action: 'Transport subsidy release for Dindigul FPO', priority: 'High', status: 'Approved', date: '2026-06-12' },
      { id: 2, action: 'Storage credit facility for Salem Onion farmers', priority: 'Medium', status: 'In Progress', date: '2026-06-14' },
      { id: 3, action: 'Mandi price floor adjustment for Tomatoes', priority: 'High', status: 'Completed', date: '2026-06-10' }
    ];

    res.json({ brief, interventions });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
