import { PrismaClient, Role, ListingStatus, BidStatus, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.notification.deleteMany({});
  await prisma.aIRecommendation.deleteMany({});
  await prisma.weatherAlert.deleteMany({});
  await prisma.marketPrice.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.farmerGroup.deleteMany({});
  await prisma.cropListing.deleteMany({});
  await prisma.farm.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Users...');

  // 15 Farmers
  const farmersData = [
    { name: 'Anbu Selvan', phone: '9876543210', email: 'anbu@gmail.com', role: Role.FARMER, language: 'ta', location: 'Madurai' },
    { name: 'Karthik Raja', phone: '9876543211', email: 'karthik@gmail.com', role: Role.FARMER, language: 'ta', location: 'Madurai' },
    { name: 'Muthu Kumar', phone: '9876543212', email: 'muthu@gmail.com', role: Role.FARMER, language: 'ta', location: 'Madurai' },
    { name: 'Ravi Chandran', phone: '9876543213', email: 'ravi@gmail.com', role: Role.FARMER, language: 'en', location: 'Salem' },
    { name: 'Senthil Kumar', phone: '9876543214', email: 'senthil@gmail.com', role: Role.FARMER, language: 'ta', location: 'Salem' },
    { name: 'Palanivelu M', phone: '9876543215', email: 'palani@gmail.com', role: Role.FARMER, language: 'ta', location: 'Salem' },
    { name: 'Ganesh Moorthy', phone: '9876543216', email: 'ganesh@gmail.com', role: Role.FARMER, language: 'en', location: 'Coimbatore' },
    { name: 'Selvaraj P', phone: '9876543217', email: 'selva@gmail.com', role: Role.FARMER, language: 'ta', location: 'Coimbatore' },
    { name: 'Murugan Swamy', phone: '9876543218', email: 'murugan@gmail.com', role: Role.FARMER, language: 'ta', location: 'Coimbatore' },
    { name: 'Rajendran K', phone: '9876543219', email: 'rajen@gmail.com', role: Role.FARMER, language: 'hi', location: 'Dindigul' },
    { name: 'Velu Mani', phone: '9876543220', email: 'velu@gmail.com', role: Role.FARMER, language: 'ta', location: 'Dindigul' },
    { name: 'Subramani S', phone: '9876543221', email: 'subra@gmail.com', role: Role.FARMER, language: 'ta', location: 'Dindigul' },
    { name: 'Thangaraj G', phone: '9876543222', email: 'thanga@gmail.com', role: Role.FARMER, language: 'en', location: 'Madurai' },
    { name: 'Natarajan P', phone: '9876543223', email: 'nata@gmail.com', role: Role.FARMER, language: 'ta', location: 'Salem' },
    { name: 'Dharmalingam', phone: '9876543224', email: 'dharma@gmail.com', role: Role.FARMER, language: 'ta', location: 'Dindigul' }
  ];

  const farmers = [];
  for (const data of farmersData) {
    const u = await prisma.user.create({ data });
    farmers.push(u);
  }

  // 5 FPOs
  const fposData = [
    { name: 'Madurai Farmers Collective', phone: '9000000001', email: 'madurai.fpo@smartag.org', role: Role.FPO, language: 'ta', location: 'Madurai' },
    { name: 'Salem Agri Group', phone: '9000000002', email: 'salem.fpo@smartag.org', role: Role.FPO, language: 'en', location: 'Salem' },
    { name: 'Coimbatore Growers Union', phone: '9000000003', email: 'coimbatore.fpo@smartag.org', role: Role.FPO, language: 'en', location: 'Coimbatore' },
    { name: 'Dindigul Crop Collective', phone: '9000000004', email: 'dindigul.fpo@smartag.org', role: Role.FPO, language: 'ta', location: 'Dindigul' },
    { name: 'Tamil Nadu Organic FPO', phone: '9000000005', email: 'tnorganic.fpo@smartag.org', role: Role.FPO, language: 'ta', location: 'Madurai' }
  ];

  const fpos = [];
  for (const data of fposData) {
    const u = await prisma.user.create({ data });
    fpos.push(u);
  }

  // 8 Buyers
  const buyersData = [
    { name: 'Rel-Agro Foods Ltd', phone: '8000000001', email: 'procure@relagro.com', role: Role.BUYER, language: 'en', location: 'Chennai' },
    { name: 'Heritage Fresh Procurement', phone: '8000000002', email: 'buy@heritage.com', role: Role.BUYER, language: 'en', location: 'Coimbatore' },
    { name: 'Madurai Veg Wholesalers', phone: '8000000003', email: 'mduveg@outlook.com', role: Role.BUYER, language: 'ta', location: 'Madurai' },
    { name: 'Salem Sago Processors', phone: '8000000004', email: 'sago@salem.com', role: Role.BUYER, language: 'en', location: 'Salem' },
    { name: 'Nilgiris Retail', phone: '8000000005', email: 'nilgiris@retail.in', role: Role.BUYER, language: 'en', location: 'Coimbatore' },
    { name: 'Annapoorna Caterers', phone: '8000000006', email: 'purchase@annapoorna.com', role: Role.BUYER, language: 'ta', location: 'Madurai' },
    { name: 'ITC Agri Business Division', phone: '8000000007', email: 'agri@itc.in', role: Role.BUYER, language: 'en', location: 'Chennai' },
    { name: 'Chennai Central Mandi Traders', phone: '8000000008', email: 'centralmandi@gmail.com', role: Role.BUYER, language: 'hi', location: 'Chennai' }
  ];

  const buyers = [];
  for (const data of buyersData) {
    const u = await prisma.user.create({ data });
    buyers.push(u);
  }

  // 3 Government Users
  const govData = [
    { name: 'State Agriculture Director', phone: '7000000001', email: 'dir.agri@tn.gov.in', role: Role.GOVERNMENT, language: 'en', location: 'Chennai' },
    { name: 'Madurai District Monitor', phone: '7000000002', email: 'monitor.mdu@tn.gov.in', role: Role.GOVERNMENT, language: 'ta', location: 'Madurai' },
    { name: 'Salem District Officer', phone: '7000000003', email: 'officer.slm@tn.gov.in', role: Role.GOVERNMENT, language: 'en', location: 'Salem' }
  ];

  for (const data of govData) {
    await prisma.user.create({ data });
  }

  console.log('Seeding Farms & AI Recommendations...');
  const crops = ['Tomato', 'Onion', 'Banana', 'Rice', 'Turmeric', 'Chilli', 'Coconut'];
  const grades = ['A', 'B', 'C'];
  const farms = [];

  // Generate 2 farms per farmer
  for (let i = 0; i < farmers.length; i++) {
    const farmer = farmers[i];
    const crop1 = crops[i % crops.length];
    const crop2 = crops[(i + 3) % crops.length];

    // Coordinates mapping based on location
    let latBase = 9.9252; // Madurai
    let lngBase = 78.1198;
    if (farmer.location === 'Salem') {
      latBase = 11.6643;
      lngBase = 78.1460;
    } else if (farmer.location === 'Coimbatore') {
      latBase = 11.0168;
      lngBase = 76.9558;
    } else if (farmer.location === 'Dindigul') {
      latBase = 10.3673;
      lngBase = 77.9803;
    }

    const farm1 = await prisma.farm.create({
      data: {
        farmerId: farmer.id,
        cropType: crop1,
        quantity: Math.floor(Math.random() * 2000) + 500,
        qualityGrade: grades[Math.floor(Math.random() * grades.length)],
        harvestDate: new Date(Date.now() + (Math.random() * 10 * 24 * 60 * 60 * 1000)), // 0-10 days later
        gpsLat: latBase + (Math.random() - 0.5) * 0.1,
        gpsLng: lngBase + (Math.random() - 0.5) * 0.1,
        status: 'REGISTERED'
      }
    });

    const farm2 = await prisma.farm.create({
      data: {
        farmerId: farmer.id,
        cropType: crop2,
        quantity: Math.floor(Math.random() * 1500) + 300,
        qualityGrade: grades[Math.floor(Math.random() * grades.length)],
        harvestDate: new Date(Date.now() + (Math.random() * 20 * 24 * 60 * 60 * 1000)), // 0-20 days later
        gpsLat: latBase + (Math.random() - 0.5) * 0.1,
        gpsLng: lngBase + (Math.random() - 0.5) * 0.1,
        status: 'REGISTERED'
      }
    });

    farms.push(farm1, farm2);

    // Create AI Recommendation for first farm
    const sellToday = 20 + Math.random() * 10;
    const sellLater = sellToday + (Math.random() * 5 + 2);
    const joinFPO = sellToday + (Math.random() * 10 + 5);
    await prisma.aIRecommendation.create({
      data: {
        farmId: farm1.id,
        sellToday,
        sellLater,
        joinFPO,
        recommendedAction: 'JOIN_FPO',
        confidence: Math.floor(Math.random() * 20) + 75, // 75-95%
        risk: 'Low',
        explanation: `Joining the local FPO Collective for ${crop1} yields approx 23% higher income due to grouped logistics discount and direct buyer contracting.`
      }
    });
  }

  console.log('Seeding 30 Days of Mandi Prices...');
  const mandiLocations = [
    { name: 'Madurai Mandi', district: 'Madurai', state: 'Tamil Nadu' },
    { name: 'Salem Mandi', district: 'Salem', state: 'Tamil Nadu' },
    { name: 'Coimbatore Mandi', district: 'Coimbatore', state: 'Tamil Nadu' },
    { name: 'Dindigul Mandi', district: 'Dindigul', state: 'Tamil Nadu' },
    { name: 'Oddanchatram Mandi', district: 'Dindigul', state: 'Tamil Nadu' }
  ];

  const cropBasePrices: Record<string, number> = {
    Tomato: 22,
    Onion: 28,
    Banana: 35,
    Rice: 45,
    Turmeric: 110,
    Chilli: 140,
    Coconut: 18
  };

  const today = new Date();
  for (let d = 0; d < 30; d++) {
    const date = new Date();
    date.setDate(today.getDate() - d);

    for (const mandi of mandiLocations) {
      for (const crop of crops) {
        const base = cropBasePrices[crop];
        // add slight noise per day and mandi
        const noise = (Math.sin(d * 0.5) + (Math.random() - 0.5)) * (base * 0.08);
        await prisma.marketPrice.create({
          data: {
            mandiName: mandi.name,
            crop,
            price: Math.max(5, parseFloat((base + noise).toFixed(2))),
            date,
            district: mandi.district,
            state: mandi.state
          }
        });
      }
    }
  }

  console.log('Seeding Weather Alerts...');
  const alerts = [
    { district: 'Madurai', alertType: 'Heavy Rain Alert', severity: 'High', message: 'Heavy convective showers expected in Madurai region over the next 48 hours. Farmers are advised to delay harvesting.', validUntil: new Date(Date.now() + 48 * 3600 * 1000) },
    { district: 'Salem', alertType: 'Heatwave warning', severity: 'Medium', message: 'Day temperatures expected to rise by 2-3 degrees. Increase irrigation frequency for vegetable crops.', validUntil: new Date(Date.now() + 72 * 3600 * 1000) },
    { district: 'Coimbatore', alertType: 'Wind Alert', severity: 'Low', message: 'High wind gusts expected. Staking recommended for banana plantations.', validUntil: new Date(Date.now() + 24 * 3600 * 1000) },
    { district: 'Dindigul', alertType: 'Pest Outbreak Alert', severity: 'Medium', message: 'Favorable conditions for Fall Armyworm in Maize. Monitor fields daily.', validUntil: new Date(Date.now() + 120 * 3600 * 1000) },
    { district: 'Madurai', alertType: 'Pest Outbreak Alert', severity: 'High', message: 'Whitefly outbreak reported in neighboring areas. Install yellow sticky traps.', validUntil: new Date(Date.now() + 72 * 3600 * 1000) },
    { district: 'Salem', alertType: 'Flash Flood Alert', severity: 'High', message: 'River water discharge increasing. Avoid fields near banks.', validUntil: new Date(Date.now() + 12 * 3600 * 1000) }
  ];

  for (const alert of alerts) {
    await prisma.weatherAlert.create({ data: alert });
  }

  console.log('Seeding Groups, Bids, and Listings...');
  // Create 5 Farmer Groups representing FPOs grouping farms
  const groupNames = [
    'Tomato Collective Group A',
    'Onion Aggregation Salem B',
    'Banana Export Batch C',
    'Rice Super Group D',
    'Turmeric Collective E'
  ];

  for (let i = 0; i < 5; i++) {
    const fpo = fpos[i % fpos.length];
    const cropType = crops[i % crops.length];
    
    const group = await prisma.farmerGroup.create({
      data: {
        fpoId: fpo.id,
        groupName: groupNames[i],
        cropType,
        totalQuantity: 0,
        collectionDate: new Date(Date.now() + (i + 2) * 24 * 3600 * 1000),
        route: JSON.stringify({
          start: fpo.location,
          points: ['Point A', 'Point B'],
          distance: 25.4
        }),
        status: i < 3 ? 'GROUPED' : 'PENDING'
      }
    });

    // Find farms with matching cropType and add as members
    const matchingFarms = farms.filter(f => f.cropType === cropType).slice(0, 3);
    let totalQty = 0;

    for (const farm of matchingFarms) {
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          farmId: farm.id,
          farmerId: farm.farmerId,
          quantity: farm.quantity
        }
      });
      totalQty += farm.quantity;

      // Update farm status
      await prisma.farm.update({
        where: { id: farm.id },
        data: { status: 'GROUPED' }
      });
    }

    // Update group total qty
    await prisma.farmerGroup.update({
      where: { id: group.id },
      data: { totalQuantity: totalQty }
    });

    // If grouped or active, create a Crop Listing for the group
    if (i < 3) {
      const listing = await prisma.cropListing.create({
        data: {
          farmId: matchingFarms[0].id, // primary farm
          farmerId: matchingFarms[0].farmerId,
          fpoId: fpo.id,
          quantity: totalQty,
          grade: 'A',
          pickupDate: new Date(Date.now() + (i + 4) * 24 * 3600 * 1000),
          status: ListingStatus.PUBLISHED
        }
      });

      // Seed 2 bids per listing
      for (let j = 0; j < 2; j++) {
        const buyer = buyers[(i * 2 + j) % buyers.length];
        const bidPrice = cropBasePrices[cropType] + (j === 0 ? 3 : -1);
        await prisma.bid.create({
          data: {
            listingId: listing.id,
            buyerId: buyer.id,
            pricePerKg: bidPrice,
            quantity: totalQty,
            pickupDate: new Date(Date.now() + (i + 5) * 24 * 3600 * 1000),
            status: BidStatus.ACTIVE
          }
        });
      }
    }
  }

  console.log('Seeding Notifications...');
  for (const farmer of farmers) {
    await prisma.notification.create({
      data: {
        userId: farmer.id,
        type: 'WEATHER_ALERT',
        title: 'Heavy Rain Warning',
        message: 'Heavy rain forecasted for your district. Plan harvests accordingly.',
        read: false
      }
    });

    await prisma.notification.create({
      data: {
        userId: farmer.id,
        type: 'PRICE_ALERT',
        title: 'Mandi Price Spike',
        message: 'Tomato price rose by 15% in Madurai Mandi today.',
        read: false
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
