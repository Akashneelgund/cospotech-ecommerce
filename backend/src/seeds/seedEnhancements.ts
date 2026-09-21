import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🕉️ Seeding Luxury D2C Enhancements (Banners, Announcements, Moods, Flash Sales)...');

  // 1. Announcements
  await prisma.announcement.deleteMany();
  await prisma.announcement.createMany({
    data: [
      { text: '✨ FREE EXPRESS INSURED SHIPPING ON ALL ORDERS ABOVE ₹999 ACROSS BHARAT', displayOrder: 1, isActive: true },
      { text: '🕉️ EVERY ARTEFACT CONSECRATED WITH VEDIC SUKTAS & TEMPLE GANGAPOOJA', displayOrder: 2, isActive: true },
      { text: '🎁 USE CODE "VEDA10" FOR 10% BLESSING DISCOUNT ON ORDERS OVER ₹999', displayOrder: 3, isActive: true },
      { text: '⚡ LIMITED DROP: HEAVY BRASS CONSECRATED CHOWKIS AVAILABLE IN RESTRICTED QUANTITY', displayOrder: 4, isActive: true }
    ]
  });
  console.log('✅ Announcements seeded');

  // 2. Luxury Hero Banners
  await prisma.banner.deleteMany();
  await prisma.banner.createMany({
    data: [
      {
        title: 'Awaken Cosmic Harmony & Divine Protection',
        subtitle: 'Authentic Pran-Pratishtha sanctified Yantras and Chowkis handcrafted from heavy gauge copper and brass.',
        badge: 'Sacred Agamic Heritage',
        imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=1920&auto=format&fit=crop',
        ctaText: 'Explore 71 Sacred Creations',
        ctaLink: '/shop',
        placement: 'HERO',
        displayOrder: 1,
        isActive: true
      },
      {
        title: 'Certified Natural Astrological Gemstones',
        subtitle: 'Consecrated 925 Sterling Silver rings in 5.25 to 7.25 Ratti with government accredited lab certifications.',
        badge: 'Planetary Energization',
        imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1920&auto=format&fit=crop',
        ctaText: 'View Gemstone Rings',
        ctaLink: '/shop?category=gemstone-rings',
        placement: 'HERO',
        displayOrder: 2,
        isActive: true
      },
      {
        title: 'Original Black Karungali & Divine Malas',
        subtitle: 'Pure ebony wood and 108-bead spiritual rosaries for deep mantra japa, aura shielding, and grounding.',
        badge: 'Ancient Siddha Tradition',
        imageUrl: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=1920&auto=format&fit=crop',
        ctaText: 'Shop Consecrated Malas',
        ctaLink: '/shop?category=sacred-bracelets',
        placement: 'HERO',
        displayOrder: 3,
        isActive: true
      }
    ]
  });
  console.log('✅ Luxury Hero Banners seeded');

  // 3. Assign Moods, ViewCounts, and LimitedDrops to Products
  const products = await prisma.product.findMany();
  const moods = [
    'Wealth & Abundance',
    'Divine Protection',
    'Peace & Harmony',
    'Health & Energy'
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const assignedMood = moods[i % moods.length];
    const isLimited = i < 4; // First 4 items are limited drops
    const viewCount = 35 + ((i * 17) % 180);

    await prisma.product.update({
      where: { id: p.id },
      data: {
        mood: assignedMood,
        isLimitedDrop: isLimited,
        viewCount
      }
    });
  }
  console.log(`✅ Assigned moods & view counts across ${products.length} products`);

  // 4. Flash Sale
  await prisma.flashSale.deleteMany();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const sampleFlashProducts = products.slice(0, 6).map(p => p.id);
  await prisma.flashSale.create({
    data: {
      title: 'Auspicious Navaratri & Diwali Consecration Flash Sale',
      description: 'Special 20% divine concession on consecrated Yantras and Gemstone Rings. Blessed by temple scholars.',
      bannerImage: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=1200',
      discountPercent: 20,
      startDate: new Date(),
      endDate: threeDaysFromNow,
      isActive: true,
      productIds: JSON.stringify(sampleFlashProducts)
    }
  });
  console.log('✅ Flash Sale created');

  // 5. Customer Rewards & Referral for demo customer
  const customer = await prisma.user.findUnique({ where: { email: 'customer@vedicveda.com' } });
  if (customer) {
    await prisma.rewardPoint.deleteMany({ where: { userId: customer.id } });
    await prisma.rewardPoint.createMany({
      data: [
        { userId: customer.id, points: 250, type: 'PURCHASE', notes: 'Welcome devotee blessing bonus' },
        { userId: customer.id, points: 100, type: 'REVIEW', notes: 'Review submitted for Bagalamukhi Yantra' }
      ]
    });

    await prisma.referral.deleteMany({ where: { referrerId: customer.id } });
    await prisma.referral.create({
      data: {
        referrerId: customer.id,
        code: 'VEDIC-ADITI',
        status: 'PENDING',
        rewardGiven: false
      }
    });
    console.log('✅ Customer rewards & referral seeded for Aditi Sharma');
  }

  // 6. Sample Abandoned Cart for Admin Insights
  await prisma.abandonedCart.deleteMany();
  if (products.length >= 2) {
    await prisma.abandonedCart.create({
      data: {
        customerEmail: 'devotee.rahul@gmail.com',
        customerPhone: '+91 98451 23098',
        subtotal: 4500,
        isRecovered: false,
        itemsSnapshot: JSON.stringify([
          { name: products[0].name, code: products[0].productCode, price: products[0].basePrice, quantity: 1 },
          { name: products[1].name, code: products[1].productCode, price: products[1].basePrice, quantity: 2 }
        ])
      }
    });
    console.log('✅ Sample abandoned cart created for admin visibility');
  }

  console.log('\n🕉️ Luxury D2C Database Enhancements complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
