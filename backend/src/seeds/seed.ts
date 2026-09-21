import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const CATEGORY_IMAGES: Record<string, string[]> = {
  'All Yantra': [
    'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1621849400072-f554417f7051?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop'
  ],
  'Ring': [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=800&auto=format&fit=crop'
  ],
  'Chowki': [
    'https://images.unsplash.com/photo-1621849400072-f554417f7051?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop'
  ],
  'Bracelet': [
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop'
  ],
  'Kit': [
    'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=800&auto=format&fit=crop'
  ],
  'General': [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop'
  ]
};

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function seed() {
  console.log('[VedicVeda Seed] Starting database initialization...');

  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('[VedicVeda Seed] Cleaned old records.');

  const superAdminPassword = await bcrypt.hash('Admin@12345', 10);
  const staffPassword = await bcrypt.hash('Staff@12345', 10);
  const customerPassword = await bcrypt.hash('Customer@12345', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@vedicveda.com',
      passwordHash: superAdminPassword,
      name: 'Acharya Vidyadhar',
      phone: '+91 98800 11223',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'
    }
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@vedicveda.com',
      passwordHash: staffPassword,
      name: 'Ramesh Shastri',
      phone: '+91 98800 44556',
      role: 'STAFF',
      status: 'ACTIVE'
    }
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@vedicveda.com',
      passwordHash: customerPassword,
      name: 'Aditi Sharma',
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop'
    }
  });

  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: 'Aditi Sharma',
      phone: '+91 98765 43210',
      addressLine1: 'Flat 402, Shanti Niketan Residency',
      addressLine2: 'Near ISKCON Temple, Rajajinagar',
      landmark: 'Opposite Sri Krishna Kalyana Mantapa',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560010',
      isDefaultShipping: true,
      isDefaultBilling: true
    }
  });

  console.log('[VedicVeda Seed] Admin, Staff, and Demo Customer created.');

  const categoryDefs = [
    {
      name: 'All Yantra',
      slug: 'all-yantra',
      description: 'Sacred geometric copper & brass yantras, energized through authentic Vedic pran-pratishtha rituals.',
      image: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=800&auto=format&fit=crop',
      displayOrder: 1
    },
    {
      name: 'Gemstone Rings',
      slug: 'gemstone-rings',
      description: '100% natural, lab-certified astrological gemstone rings crafted in pure silver and panchdhatu.',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
      displayOrder: 2
    },
    {
      name: 'Sacred Chowki',
      slug: 'sacred-chowki',
      description: 'Handcrafted temple-grade brass and gold-polished sanctified deity chowkis for daily altar worship.',
      image: 'https://images.unsplash.com/photo-1621849400072-f554417f7051?q=80&w=800&auto=format&fit=crop',
      displayOrder: 3
    },
    {
      name: 'Sacred Bracelets',
      slug: 'sacred-bracelets',
      description: 'Genuine Karungali (Black Ebony Wood) and sacred protective amulets and bracelets.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
      displayOrder: 4
    },
    {
      name: 'Spiritual Kits',
      slug: 'spiritual-kits',
      description: 'Comprehensive sadhana and puja kits with sanctified yantras, organic dhoop, and sacred samagri.',
      image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop',
      displayOrder: 5
    },
    {
      name: 'Consecrated Malas & Artefacts',
      slug: 'consecrated-malas-artefacts',
      description: 'Authentic 108-bead Tulsi, Rudraksha, Karungali japa malas, Narmada Shiva Lingams, and sacred idols.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
      displayOrder: 6
    }
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoryDefs) {
    const created = await prisma.category.create({ data: cat });
    categoryMap.set(cat.name, created.id);
  }

  categoryMap.set('Ring', categoryMap.get('Gemstone Rings')!);
  categoryMap.set('Chowki', categoryMap.get('Sacred Chowki')!);
  categoryMap.set('Bracelet', categoryMap.get('Sacred Bracelets')!);
  categoryMap.set('Kit', categoryMap.get('Spiritual Kits')!);
  categoryMap.set('General', categoryMap.get('Consecrated Malas & Artefacts')!);

  console.log('[VedicVeda Seed] Categories initialized.');

  const excelPath = path.resolve(__dirname, '../../../data/Product-Portfolio.xlsx');
  const wb = xlsx.readFile(excelPath);
  const sheet = wb.Sheets['Master Inventory'];
  const rawRows: any[] = xlsx.utils.sheet_to_json(sheet);

  console.log('[VedicVeda Seed] Parsing rows from Excel: ' + rawRows.length);

  let importedCount = 0;

  for (const row of rawRows) {
    const rawCode = row['Code'];
    const rawCategory = row['Categare'] || row['Category'];
    const rawName = row['Product Names '] || row['Product Names'] || row['Product Name'];
    const rawSize = row['Size'] || 'Regular';
    const rawQty = Number(row['Qty available'] ?? 0);
    const rawPrice = Number(row['Unit price'] ?? 0);
    const rawSplPrice = row['Spl price for the month'] ? Number(row['Spl price for the month']) : null;

    if (!rawName || !rawCode || isNaN(rawPrice) || rawPrice <= 0) {
      continue;
    }

    const cleanCode = String(rawCode).trim().padStart(4, '0');
    const cleanName = String(rawName).trim();
    const cleanCategory = String(rawCategory || 'General').trim();
    const cleanSize = String(rawSize).trim();

    const categoryId = categoryMap.get(cleanCategory) || categoryMap.get('General')!;

    const imgList = CATEGORY_IMAGES[cleanCategory] || CATEGORY_IMAGES['General'];
    const primaryImg = imgList[importedCount % imgList.length];
    const secondaryImg = imgList[(importedCount + 1) % imgList.length];

    const description = 'Authentic, temple-consecrated ' + cleanName + ' (' + cleanSize + ') energized according to authentic Vedic rituals. Handcrafted by master artisans using premium sacred materials to channel divine vibrations of health, abundance, peace, and spiritual illumination.';
    const spiritualSignificance = 'This sacred ' + cleanName + ' is energized with traditional Vedic mantras during Brahma Muhurta. Ideal for home altar, puja room, meditation sanctum, or workplace to ward off negative energies and invite cosmic harmony.';

    const specs = JSON.stringify({
      Material: cleanCategory === 'Ring' ? '925 Sterling Silver & Natural Certified Gemstone' : cleanCategory === 'All Yantra' ? 'Heavy Gauge Embossed Sacred Copper' : 'Organic Temple Energized Sacred Craft',
      Dimensions: cleanSize.includes('Big') ? '3 x 3 inches' : cleanSize.includes('Small') ? '2 x 2 inches' : 'Standard Sacred Measure',
      Consecration: 'Pran-Pratishtha performed with Vedic Suktas',
      CountryOfOrigin: 'India (Bharat)',
      CareInstructions: 'Wipe gently with dry cotton cloth; avoid harsh chemical detergents.'
    });

    const slug = slugify(cleanName) + '-' + cleanCode;
    const isFeatured = importedCount < 8;
    const isBestseller = rawQty > 50 && rawPrice <= 2500;

    const product = await prisma.product.create({
      data: {
        productCode: cleanCode,
        name: cleanName,
        slug,
        description,
        spiritualSignificance,
        specifications: specs,
        categoryId,
        basePrice: rawPrice,
        specialPrice: (rawSplPrice && rawSplPrice > 0 && rawSplPrice < rawPrice) ? rawSplPrice : null,
        isActive: true,
        isFeatured,
        isBestseller,
        rating: Number((4.7 + (importedCount % 4) * 0.1).toFixed(1)),
        reviewCount: 15 + (importedCount * 3) % 45,
        seoTitle: 'Buy Authentic ' + cleanName + ' (' + cleanSize + ') Online | VedicVeda',
        seoDescription: 'Order energized ' + cleanName + ' online. Consecrated with Vedic mantras, free delivery across India, and certificate of sacred authenticity.'
      }
    });

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: primaryImg,
        altText: cleanName + ' - Front View',
        isPrimary: true,
        displayOrder: 1
      }
    });

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: secondaryImg,
        altText: cleanName + ' - Sanctified Perspective',
        isPrimary: false,
        displayOrder: 2
      }
    });

    const sku = 'SKU-' + cleanCode + '-' + slugify(cleanSize).toUpperCase();
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        size: cleanSize,
        sku,
        price: rawPrice,
        specialPrice: (rawSplPrice && rawSplPrice > 0 && rawSplPrice < rawPrice) ? rawSplPrice : null,
        stock: rawQty
      }
    });

    await prisma.inventoryTransaction.create({
      data: {
        variantId: variant.id,
        changeQty: rawQty,
        previousQty: 0,
        newQty: rawQty,
        reason: 'RESTOCK',
        notes: 'Initial seed import from Excel (Master Inventory row ' + (importedCount + 2) + ')',
        createdBy: 'ACHARYA_ADMIN'
      }
    });

    importedCount++;
  }

  console.log('[VedicVeda Seed] Successfully imported ' + importedCount + ' products with variants & stock.');

  await prisma.coupon.createMany({
    data: [
      {
        code: 'VEDA10',
        description: '10% instant discount on all sacred items for orders above ₹999',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 999,
        maxDiscount: 500,
        validUntil: new Date('2027-12-31'),
        usageLimit: 1000,
        isActive: true
      },
      {
        code: 'DIVINE500',
        description: 'Flat ₹500 off on sacred collections above ₹2,999',
        discountType: 'FIXED',
        discountValue: 500,
        minOrderValue: 2999,
        validUntil: new Date('2027-12-31'),
        usageLimit: 500,
        isActive: true
      },
      {
        code: 'FIRSTBUY',
        description: '15% welcome blessing discount for new devotees',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderValue: 500,
        maxDiscount: 750,
        validUntil: new Date('2027-12-31'),
        usageLimit: 10000,
        isActive: true
      }
    ]
  });

  console.log('[VedicVeda Seed] Discount coupons created.');

  const featuredProducts = await prisma.product.findMany({ take: 5, include: { variants: true } });
  const reviewQuotes = [
    { rating: 5, comment: 'The pran-pratishtha energy of this yantra is truly palpable. The copper engraving is razor sharp and comes with clear puja guidelines.' },
    { rating: 5, comment: 'Exquisite finish and authentically certified. I placed it in my Ishanya (Northeast) corner and felt an immediate sense of serenity.' },
    { rating: 5, comment: 'Remarkable packaging with Gangajal and sacred akshat. Fast insured delivery to Bengaluru. Highly recommended!' },
    { rating: 4, comment: 'Very high quality authentic gemstone ring. The certificate gave me complete peace of mind.' }
  ];

  for (let i = 0; i < featuredProducts.length; i++) {
    const prod = featuredProducts[i];
    const q = reviewQuotes[i % reviewQuotes.length];
    await prisma.review.create({
      data: {
        productId: prod.id,
        userId: customer.id,
        userName: 'Aditi Sharma',
        rating: q.rating,
        comment: q.comment,
        isVerifiedPurchase: true,
        isApproved: true
      }
    });
  }

  if (featuredProducts.length >= 2) {
    const p1 = featuredProducts[0];
    const v1 = p1.variants[0];
    const p2 = featuredProducts[1];
    const v2 = p2.variants[0];

    const sampleOrder1 = await prisma.order.create({
      data: {
        orderNumber: 'VEDA-2026-1001',
        userId: customer.id,
        customerName: 'Aditi Sharma',
        customerEmail: 'customer@vedicveda.com',
        customerPhone: '+91 98765 43210',
        shippingAddress: JSON.stringify({
          fullName: 'Aditi Sharma',
          phone: '+91 98765 43210',
          addressLine1: 'Flat 402, Shanti Niketan Residency',
          addressLine2: 'Near ISKCON Temple, Rajajinagar',
          landmark: 'Opposite Sri Krishna Kalyana Mantapa',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560010'
        }),
        billingAddress: JSON.stringify({
          fullName: 'Aditi Sharma',
          phone: '+91 98765 43210',
          addressLine1: 'Flat 402, Shanti Niketan Residency',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560010'
        }),
        subtotal: v1.price + v2.price,
        discount: 250,
        taxAmount: 75,
        shippingFee: 0,
        totalAmount: v1.price + v2.price - 250 + 75,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        trackingNumber: 'DTDC-BLR-89214710',
        courierName: 'DTDC Express',
        items: {
          create: [
            {
              productId: p1.id,
              variantId: v1.id,
              productName: p1.name,
              productCode: p1.productCode,
              size: v1.size,
              price: v1.price,
              quantity: 1,
              total: v1.price
            },
            {
              productId: p2.id,
              variantId: v2.id,
              productName: p2.name,
              productCode: p2.productCode,
              size: v2.size,
              price: v2.price,
              quantity: 1,
              total: v2.price
            }
          ]
        },
        payments: {
          create: {
            transactionId: 'TXN-UPI-9988112233',
            provider: 'UPI',
            amount: v1.price + v2.price - 250 + 75,
            status: 'COMPLETED',
            details: JSON.stringify({ vpa: 'aditi@okhdfcbank', rrn: '624510982314' })
          }
        }
      }
    });

    const sampleOrder2 = await prisma.order.create({
      data: {
        orderNumber: 'VEDA-2026-1002',
        customerName: 'Vikramaditya Roy',
        customerEmail: 'vikram.roy@example.com',
        customerPhone: '+91 98200 77665',
        shippingAddress: JSON.stringify({
          fullName: 'Vikramaditya Roy',
          phone: '+91 98200 77665',
          addressLine1: 'Villa 12, Gulmohar Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400049'
        }),
        billingAddress: JSON.stringify({
          fullName: 'Vikramaditya Roy',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400049'
        }),
        subtotal: v1.price * 2,
        discount: 0,
        taxAmount: 90,
        shippingFee: 0,
        totalAmount: v1.price * 2 + 90,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PAID',
        orderStatus: 'CONFIRMED',
        trackingNumber: 'BLUEDART-BOM-1120938',
        courierName: 'Blue Dart Sacred Cargo',
        items: {
          create: [
            {
              productId: p1.id,
              variantId: v1.id,
              productName: p1.name,
              productCode: p1.productCode,
              size: v1.size,
              price: v1.price,
              quantity: 2,
              total: v1.price * 2
            }
          ]
        },
        payments: {
          create: {
            transactionId: 'pay_MockRazorpay7729',
            provider: 'RAZORPAY',
            amount: v1.price * 2 + 90,
            status: 'COMPLETED',
            details: JSON.stringify({ paymentId: 'pay_MockRazorpay7729', method: 'card' })
          }
        }
      }
    });

    console.log('[VedicVeda Seed] Sample Orders ' + sampleOrder1.orderNumber + ' & ' + sampleOrder2.orderNumber + ' seeded.');
  }

  console.log('[VedicVeda Seed] Database initialization completed successfully!');
}

seed()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
