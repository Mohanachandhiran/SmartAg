const express = require('express');
const router = express.Router();
const axios = require('axios');

function calculateRiskScore(temp, humidity, rainfall) {
  // Simple heuristics for agricultural risk
  let riskScore = 0;
  
  if (temp > 35 || temp < 5) riskScore += 2;
  if (temp > 40) riskScore += 3;
  
  if (humidity > 85) riskScore += 1;
  
  if (rainfall > 20) riskScore += 2;
  if (rainfall > 50) riskScore += 3;

  if (riskScore >= 4) return 'High';
  if (riskScore >= 2) return 'Medium';
  return 'Low';
}

router.get('/', async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    const OPEN_METEO_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`;
    
    const response = await axios.get(OPEN_METEO_URL);
    const data = response.data;

    if (!data || !data.current) {
      throw new Error('Invalid response from Weather API');
    }

    const current = data.current;
    
    const temperature = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const rainfall = current.precipitation;
    const windSpeed = current.wind_speed_10m;

    const riskScore = calculateRiskScore(temperature, humidity, rainfall);

    res.json({
      temperature,
      humidity,
      rainfall,
      windSpeed,
      riskScore,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Weather Service Error:', err.message);
    // Graceful fallback if external API fails
    res.json({
      temperature: 28.5,
      humidity: 60,
      rainfall: 0,
      windSpeed: 12,
      riskScore: 'Low',
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
});

module.exports = router;
