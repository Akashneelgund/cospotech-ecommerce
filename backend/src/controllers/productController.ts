import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      size,
      inStock,
      sort = 'featured',
      page = '1',
      limit = '24'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 24));
    const skip = (pageNum - 1) * take;

    const where: any = {
      isActive: true
    };

    if (category && category !== 'all') {
      where.category = {
        slug: String(category)
      };
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { productCode: { contains: q } },
        { description: { contains: q } },
        { category: { name: { contains: q } } }
      ];
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(String(minPrice));
      if (maxPrice) where.basePrice.lte = parseFloat(String(maxPrice));
    }

    if (size && size !== 'all') {
      where.variants = {
        some: {
          size: { contains: String(size) }
        }
      };
    }

    if (inStock === 'true') {
      where.variants = {
        some: {
          stock: { gt: 0 }
        }
      };
    }

    let orderBy: any = { isFeatured: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'price-low-high') orderBy = { basePrice: 'asc' };
    else if (sort === 'price-high-low') orderBy = { basePrice: 'desc' };
    else if (sort === 'bestseller') orderBy = { isBestseller: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: true,
          images: { orderBy: { displayOrder: 'asc' } }
        },
        orderBy,
        skip,
        take
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error: any) {
    console.error('getProducts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q ? String(req.query.q) : '').trim();
    if (!q || q.length < 2) {
      res.json({ success: true, suggestions: [] });
      return;
    }

    const matches = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { productCode: { contains: q } },
          { category: { name: { contains: q } } }
        ]
      },
      select: {
        id: true,
        name: true,
        productCode: true,
        slug: true,
        basePrice: true,
        specialPrice: true,
        category: { select: { name: true } },
        images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
        variants: { select: { stock: true } }
      },
      take: 8
    });

    const suggestions = matches.map(p => ({
      id: p.id,
      name: p.name,
      code: p.productCode,
      slug: p.slug,
      price: p.specialPrice || p.basePrice,
      originalPrice: p.basePrice,
      category: p.category.name,
      image: p.images[0]?.url || '',
      inStock: p.variants.some(v => v.stock > 0)
    }));

    res.json({ success: true, suggestions });
  } catch (error: any) {
    console.error('getSearchSuggestions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suggestions.' });
  }
};

export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
        images: { orderBy: { displayOrder: 'asc' } }
      },
      take: 8
    });

    res.json({ success: true, products });
  } catch (error: any) {
    console.error('getFeaturedProducts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured products.' });
  }
};

export const getBestsellers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isBestseller: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
        images: { orderBy: { displayOrder: 'asc' } }
      },
      take: 8
    });

    res.json({ success: true, products });
  } catch (error: any) {
    console.error('getBestsellers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bestsellers.' });
  }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } }
        }
      }
    });

    res.json({ success: true, categories });
  } catch (error: any) {
    console.error('getCategories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

export const getProductBySlugOrCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const identifier = String(req.params.identifier);

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: identifier },
          { productCode: identifier },
          { id: identifier }
        ]
      },
      include: {
        category: true,
        variants: {
          orderBy: { price: 'asc' }
        },
        images: {
          orderBy: { displayOrder: 'asc' }
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true
      },
      include: {
        variants: true,
        images: { orderBy: { displayOrder: 'asc' } }
      },
      take: 4
    });

    res.json({ success: true, product, related });
  } catch (error: any) {
    console.error('getProductBySlugOrCode error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details.' });
  }
};

export const addProductReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { rating, comment, userName } = req.body;

    if (!rating || rating < 1 || rating > 5 || !comment) {
      res.status(400).json({ success: false, message: 'Rating (1-5) and comment are required.' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        productId: id,
        userId: req.user?.id || null,
        userName: userName || req.user?.name || 'Devoted Customer',
        rating: Number(rating),
        comment: String(comment).trim(),
        isVerifiedPurchase: true,
        isApproved: true
      }
    });

    const allReviews = await prisma.review.findMany({ where: { productId: id, isApproved: true } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.product.update({
      where: { id },
      data: {
        rating: Number(avgRating.toFixed(1)),
        reviewCount: allReviews.length
      }
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully.', review });
  } catch (error: any) {
    console.error('addProductReview error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};
