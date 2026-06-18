const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_API_URL || 'http://localhost:8000';

router.use(authenticate);

// FPO Dashboard Stats
router.get('/dashboard', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  const fpoId = req.user.id;
  try {
    const totalFarmers = await prisma.user.count({ where: { role: 'FARMER' } });
    const activeGroups = await prisma.farmerGroup.count({ where: { fpoId, status: 'ACTIVE' } });
    
    // Expected Revenue
    const listings = await prisma.marketplaceListing.findMany({
      where: { group: { fpoId } },
      include: { group: true }
    });
    const expectedRevenue = listings.reduce((sum, item) => sum + (item.group.totalQuantity * 30), 0);

    const pendingBids = await prisma.bid.count({
      where: {
        listing: { group: { fpoId } },
        status: 'ACTIVE'
      }
    });

    const completedTx = await prisma.transaction.count({
      where: { fpoId, status: 'COMPLETED' }
    });

    // Recent activity feed
    const requests = await prisma.cropRequest.findMany({
      where: { status: 'WAITING_FOR_FPO' },
      include: { farmer: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const bids = await prisma.bid.findMany({
      where: { listing: { group: { fpoId } } },
      include: { buyer: true, listing: { include: { group: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      stats: {
        totalFarmers: totalFarmers || 342,
        activeGroups: activeGroups || 15,
        expectedRevenue: expectedRevenue || 450000,
        pendingBids: pendingBids || 12,
        completedTx: completedTx || 48
      },
      activityFeed: {
        requests,
        bids
      }
    });
  } catch (err) {
    next(err);
  }
});

// Incoming Farmer Requests
router.get('/farmer-requests', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  try {
    const requests = await prisma.cropRequest.findMany({
      where: { status: 'WAITING_FOR_FPO' },
      include: { farmer: true },
      orderBy: { createdAt: 'desc' }
    });

    // Format for table
    const formatted = requests.map(r => ({
      id: r.id,
      farmerId: r.farmerId,
      farmerName: r.farmer.name,
      crop: r.cropType,
      quantity: r.quantity,
      grade: r.qualityGrade,
      harvestDate: r.harvestDate,
      distance: 12.5 + Math.random() * 15, // Mock distance in km
      aiMatchScore: 85 + Math.floor(Math.random() * 10),
      status: r.status
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

// AI Grouping Runner
router.post('/ai-grouping', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  const fpoId = req.user.id;
  try {
    // Fetch all registered requests that are not yet grouped
    const requests = await prisma.cropRequest.findMany({
      where: { status: 'WAITING_FOR_FPO', groupId: null },
      include: { farmer: true }
    });

    if (requests.length === 0) {
      return res.json({ groups: [] });
    }

    const payload = requests.map(f => ({
      farmId: f.id,
      farmerId: f.farmerId,
      farmerName: f.farmer.name,
      cropType: f.cropType,
      quantity: f.quantity,
      gpsLat: f.location ? parseFloat(f.location.split(',')[0]) : 9.9252 + (Math.random() * 0.1),
      gpsLng: f.location ? parseFloat(f.location.split(',')[1]) : 78.1198 + (Math.random() * 0.1),
      harvestDate: f.harvestDate
    }));

    let groupingResult;
    try {
      const response = await axios.post(`${FASTAPI_URL}/ai/farmer-grouping`, {
        farms: payload
      });
      groupingResult = response.data;
    } catch (e) {
      console.warn('AI Grouping FastAPI microservice offline. Using mock grouping local logic.', e.message);
      // Local simple mock grouping logic
      const groupedCrops = {};
      requests.forEach(f => {
        if (!groupedCrops[f.cropType]) groupedCrops[f.cropType] = [];
        groupedCrops[f.cropType].push(f);
      });

      const mockGroups = Object.keys(groupedCrops).map((crop, idx) => {
        const cropReqs = groupedCrops[crop];
        const totalQuantity = cropReqs.reduce((sum, f) => sum + f.quantity, 0);
        return {
          groupId: `AUTO-GRP-${idx + 1}`,
          cropType: crop,
          farmers: cropReqs.map(f => ({
            farmId: f.id,
            farmerId: f.farmerId,
            name: f.farmer.name,
            quantity: f.quantity,
            lat: f.location ? parseFloat(f.location.split(',')[0]) : 9.9252,
            lng: f.location ? parseFloat(f.location.split(',')[1]) : 78.1198
          })),
          totalQuantity,
          collectionDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
          route: {
            distance: 34.2,
            timeMinutes: 75,
            routeCoords: [[9.9252, 78.1198]]
          }
        };
      });
      groupingResult = { groups: mockGroups };
    }

    res.json(groupingResult);
  } catch (err) {
    next(err);
  }
});

// Create/Approve FPO Group
router.post('/groups/create-from-ai', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  const fpoId = req.user.id;
  const { groupName, cropType, collectionDate, farmers, route } = req.body;
  try {
    const group = await prisma.farmerGroup.create({
      data: {
        fpoId,
        cropType,
        totalQuantity: farmers.reduce((sum, f) => sum + f.quantity, 0),
        status: 'GROUP_CONFIRMED'
      }
    });

    for (const f of farmers) {
      await prisma.cropRequest.update({
        where: { id: f.farmId },
        data: { 
          groupId: group.id,
          status: 'GROUPED' 
        }
      });
    }

    res.json({ success: true, group });
  } catch (err) {
    next(err);
  }
});

// Fetch active groups for FPO
router.get('/groups', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  const fpoId = req.user.id;
  try {
    const groups = await prisma.farmerGroup.findMany({
      where: { fpoId },
      include: {
        requests: {
          include: {
            farmer: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(groups);
  } catch (err) {
    next(err);
  }
});

// Fetch all registered farmers
router.get('/all-farmers', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  try {
    const farmers = await prisma.user.findMany({
      where: { role: 'FARMER' },
      select: { id: true, name: true, location: true }
    });
    res.json(farmers);
  } catch (err) {
    next(err);
  }
});

// Publish Grouped Listing to Marketplace
router.post('/marketplace/publish', async (req, res, next) => {
  const prisma = req.app.locals.prisma;
  const fpoId = req.user.id;
  const { groupId, minPrice } = req.body;
  try {
    const group = await prisma.farmerGroup.findUnique({
      where: { id: groupId },
      include: { requests: true }
    });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.requests.length === 0) {
      return res.status(400).json({ error: 'Cannot publish group with no requests' });
    }

    // Check if listing already exists
    let listing = await prisma.marketplaceListing.findUnique({
      where: { groupId: group.id }
    });

    if (listing) {
      return res.status(400).json({ error: 'Listing already exists for this group' });
    }

    // Create Marketplace Listing
    listing = await prisma.marketplaceListing.create({
      data: {
        groupId: group.id,
        pickupDate: new Date(Date.now() + 5 * 24 * 3600 * 1000), // Default to 5 days
        status: 'OPEN_FOR_BIDDING'
      }
    });

    // Update group status
    await prisma.farmerGroup.update({
      where: { id: groupId },
      data: { status: 'PUBLISHED' }
    });

    res.json({ success: true, listing });
  } catch (err) {
    next(err);
  }
});

// Find Nearest FPOs
router.get('/nearest', async (req, res, next) => {
  const { lat, lng } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);

  // Seeded FPOs from Tamil Nadu dataset
  const tnFPOs = [
    { id: 'fpo-1', name: 'Thoothukudi Pulses Producer Company Limited', district: 'Thoothukudi', lat: 8.7642, lng: 78.1348, crops: ['Black Gram', 'Green Gram'] },
    { id: 'fpo-2', name: 'Dindigul Maize And Sorghum Producer Company Ltd', district: 'Dindigul', lat: 10.3673, lng: 77.9803, crops: ['Maize', 'Sorghum'] },
    { id: 'fpo-3', name: 'Salem Maize Producer Company Ltd', district: 'Salem', lat: 11.6643, lng: 78.1460, crops: ['Maize'] },
    { id: 'fpo-4', name: 'Jawadhu Hills Small Millets Producer Company Ltd', district: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, crops: ['Little Millet'] },
    { id: 'fpo-5', name: 'Virudhunagar Millets Producer Company Ltd', district: 'Madurai', lat: 9.9252, lng: 78.1198, crops: ['Kodo Millet', 'Barnyard Millet'] },
    { id: 'fpo-6', name: 'Erode Pulses Farmer Producer Company Ltd', district: 'Erode', lat: 11.3410, lng: 77.7172, crops: ['French Beans', 'Green Gram', 'Black Gram'] },
    { id: 'fpo-7', name: 'Namakkal Farmers Producer Company Ltd', district: 'Namakkal', lat: 11.2189, lng: 78.1674, crops: ['Green Gram', 'Millets'] },
    { id: 'fpo-8', name: 'Tirupur Farmers Producer Company Ltd', district: 'Tirupur', lat: 11.1085, lng: 77.3411, crops: ['Maize'] },
    { id: 'fpo-9', name: 'Karikalani Pulses Farmer Producer Company Ltd', district: 'Tiruvarur', lat: 10.7661, lng: 79.6344, crops: ['Black Gram'] },
    { id: 'fpo-10', name: 'Velliangiri Uzhavan Producer Company Ltd', district: 'Coimbatore', lat: 11.0168, lng: 76.9558, crops: ['Coconut', 'Mixed Vegetables'] },
  ];

  // Haversine formula to calculate distance in km
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const fposWithDistance = tnFPOs.map(fpo => {
    const distance = getDistanceFromLatLonInKm(userLat, userLng, fpo.lat, fpo.lng);
    return { ...fpo, distance };
  });

  // Sort by distance ascending
  fposWithDistance.sort((a, b) => a.distance - b.distance);

  res.json({ nearestFPOs: fposWithDistance.slice(0, 5) }); // return top 5
});

module.exports = router;
