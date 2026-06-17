const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticate } = require('../middleware/auth');

const FASTAPI_URL = process.env.FASTAPI_API_URL || 'http://localhost:8000';

router.use(authenticate);

// Route helper to post to FastAPI and catch errors
const forwardToAI = (endpoint) => {
  return async (req, res, next) => {
    try {
      const response = await axios.post(`${FASTAPI_URL}${endpoint}`, req.body);
      res.json(response.data);
    } catch (err) {
      console.error(`AI Microservice error on ${endpoint}:`, err.message);
      // Return a structured mock fallback so the frontend doesn't crash
      res.status(502).json({
        error: 'AI service temporarily unavailable. Displaying local fallback recommendation.',
        details: err.message,
        fallback: true
      });
    }
  };
};

router.post('/price-forecast', forwardToAI('/ai/price-forecast'));
router.post('/selling-recommendation', forwardToAI('/ai/selling-recommendation'));
router.post('/farmer-grouping', forwardToAI('/ai/farmer-grouping'));
router.post('/buyer-recommendation', forwardToAI('/ai/buyer-recommendation'));
router.post('/risk-engine', forwardToAI('/ai/risk-engine'));
router.post('/voice-chat', forwardToAI('/ai/voice-chat'));

module.exports = router;
