import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please log in to view your wishlist.' });
      return;
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
                variants: true
              }
            }
          }
        }
      }
    });

    if (!wishlist) {
      res.json({ success: true, items: [] });
      return;
    }

    const items = wishlist.items.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      code: item.product.productCode,
      basePrice: item.product.basePrice,
      specialPrice: item.product.specialPrice,
      image: item.product.images[0]?.url || '',
      inStock: item.product.variants.some(v => v.stock > 0),
      variants: item.product.variants
    }));

    res.json({ success: true, items });
  } catch (error: any) {
    console.error('getWishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
};

export const toggleWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please log in to save items to your wishlist.' });
      return;
    }

    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    const wishlist = await prisma.wishlist.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id }
    });

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      }
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      res.json({ success: true, isWishlisted: false, message: 'Removed from sacred wishlist.' });
    } else {
      await prisma.wishlistItem.create({
        data: { wishlistId: wishlist.id, productId }
      });
      res.json({ success: true, isWishlisted: true, message: 'Added to sacred wishlist.' });
    }
  } catch (error: any) {
    console.error('toggleWishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to update wishlist.' });
  }
};
