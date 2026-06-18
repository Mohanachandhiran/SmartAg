const express = require('express');
const router = express.Router();
const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_API_URL || 'http://localhost:8000';

// Proxy helper for GET requests
const proxyGet = (endpoint) => {
  return async (req, res, next) => {
    try {
      // Forward query parameters
      const response = await axios.get(`${FASTAPI_URL}${endpoint}`, { params: req.query });
      res.json(response.data);
    } catch (err) {
      console.error(`Mandi pricing proxy error on GET ${endpoint}:`, err.message);
      res.status(err.response?.status || 502).json({
        error: 'Mandi pricing service temporarily unavailable.',
        details: err.message,
        fallback: true
      });
    }
  };
};

// Proxy helper for POST requests
const proxyPost = (endpoint) => {
  return async (req, res, next) => {
    try {
      const response = await axios.post(`${FASTAPI_URL}${endpoint}`, req.body);
      res.json(response.data);
    } catch (err) {
      console.error(`Mandi pricing proxy error on POST ${endpoint}:`, err.message);
      res.status(err.response?.status || 502).json({
        error: 'Mandi pricing service temporarily unavailable.',
        details: err.message,
        fallback: true
      });
    }
  };
};

// Endpoints
router.get('/commodities', proxyGet('/api/commodities'));
router.get('/markets', proxyGet('/api/markets'));
router.get('/dashboard', proxyGet('/api/dashboard'));
router.get('/forecast', proxyGet('/api/forecast'));
router.get('/risk', proxyGet('/api/risk'));
router.get('/data-quality', proxyGet('/api/data-quality'));
router.get('/reports', proxyGet('/api/reports'));
router.post('/advisor/chat', proxyPost('/api/advisor/chat'));

// Proxy PDF download
router.get('/reports/pdf', async (req, res, next) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/api/reports/pdf`, {
      params: req.query,
      responseType: 'arraybuffer'
    });
    res.setHeader('Content-Type', 'application/pdf');
    if (response.headers['content-disposition']) {
      res.setHeader('Content-Disposition', response.headers['content-disposition']);
    }
    res.send(response.data);
  } catch (err) {
    console.error('Mandi Pricing PDF download proxy error:', err.message);
    res.status(502).json({ error: 'Failed to download report PDF.', details: err.message });
  }
});

module.exports = router;
