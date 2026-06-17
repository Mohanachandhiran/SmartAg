const express = require('express');
const axios = require('axios');
const router = express.Router();

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// Get market prices from AI Dataset
router.get('/prices', async (req, res, next) => {
  try {
    const { crop, district, search } = req.query;
    
    // Fetch base dataset from AI service
    const response = await axios.get(`${FASTAPI_URL}/ai/mandi-prices`);
    let prices = response.data;
    
    // Process filtering
    if (crop) {
      prices = prices.filter(p => p.crop.toLowerCase() === crop.toLowerCase());
    }
    if (district) {
      prices = prices.filter(p => p.district.toLowerCase() === district.toLowerCase());
    }
    if (search) {
      const term = search.toLowerCase();
      prices = prices.filter(p => 
        p.crop.toLowerCase().includes(term) || 
        p.mandiName.toLowerCase().includes(term) || 
        p.district.toLowerCase().includes(term)
      );
    }
    
    res.json(prices);
  } catch (err) {
    // Return fallback if python is down
    console.warn("Python AI Dataset unavailable. Returning fallback data.");
    res.json([
        { id: '1', mandiName: 'Madurai Mandi', crop: 'Tomato', price: 23.5, district: 'Madurai', distance: 8.4 },
        { id: '2', mandiName: 'Salem Mandi', crop: 'Onion', price: 28.2, district: 'Salem', distance: 15.2 },
        { id: '3', mandiName: 'Coimbatore Mandi', crop: 'Banana', price: 36.0, district: 'Coimbatore', distance: 22.1 }
    ]);
  }
});

// Get weather alerts
router.get('/alerts', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  const { district } = req.query;
  try {
    const whereClause = {};
    if (district) {
      whereClause.district = { equals: district, mode: 'insensitive' };
    }
    const alerts = await prisma.weatherAlert.findMany({
      where: whereClause,
      orderBy: { validUntil: 'asc' }
    });
    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
