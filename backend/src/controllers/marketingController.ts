import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getActiveFlashSale = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const flashSale = await prisma.flashSale.findFirst({
      where: {
        isActive: true,
        endDate: { gte: now }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!flashSale) {
      res.json({ success: true, flashSale: null });
      return;
    }

    let productIds: string[] = [];
    try {
      productIds = JSON.parse(flashSale.productIds);
    } catch {
      productIds = [];
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        variants: true
      }
    });

    res.json({
      success: true,
      flashSale: {
        ...flashSale,
        products
      }
    });
  } catch (error: any) {
    console.error('getActiveFlashSale error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch flash sale.' });
  }
};

export const getRewards = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const pointsHistory = await prisma.rewardPoint.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    const balance = pointsHistory.reduce((sum, p) => sum + p.points, 0);

    res.json({
      success: true,
      balance,
      history: pointsHistory
    });
  } catch (error: any) {
    console.error('getRewards error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch rewards.' });
  }
};

export const getReferralInfo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    let referral = await prisma.referral.findFirst({
      where: { referrerId: req.user.id }
    });

    if (!referral) {
      const code = `VEDIC-${req.user.name.slice(0, 4).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
      referral = await prisma.referral.create({
        data: {
          referrerId: req.user.id,
          code
        }
      });
    }

    const totalReferrals = await prisma.referral.count({
      where: { referrerId: req.user.id }
    });

    res.json({
      success: true,
      code: referral.code,
      totalReferrals,
      rewardPerReferral: 150 // ₹150 off or 150 points
    });
  } catch (error: any) {
    console.error('getReferralInfo error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch referral info.' });
  }
};

export const recordAbandonedCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, subtotal, items } = req.body;
    if (!email && !phone) {
      res.status(400).json({ success: false, message: 'Email or phone required.' });
      return;
    }

    const cart = await prisma.abandonedCart.create({
      data: {
        customerEmail: email || null,
        customerPhone: phone || null,
        subtotal: Number(subtotal) || 0,
        itemsSnapshot: JSON.stringify(items || [])
      }
    });

    res.json({ success: true, cartId: cart.id });
  } catch (error: any) {
    console.error('recordAbandonedCart error:', error);
    res.status(500).json({ success: false, message: 'Failed to record cart.' });
  }
};

export const getAbandonedCarts = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const abandonedCarts = await prisma.abandonedCart.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const totalPotentialRevenue = abandonedCarts.reduce((sum, c) => sum + c.subtotal, 0);

    res.json({
      success: true,
      abandonedCarts,
      totalCount: abandonedCarts.length,
      totalPotentialRevenue
    });
  } catch (error: any) {
    console.error('getAbandonedCarts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch abandoned carts.' });
  }
};

export const getAllFlashSales = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const flashSales = await prisma.flashSale.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, flashSales });
  } catch (error: any) {
    console.error('getAllFlashSales error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch flash sales.' });
  }
};

export const createFlashSale = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, bannerImage, discountPercent, startDate, endDate, productIds, isActive } = req.body;
    if (!title || !endDate) {
      res.status(400).json({ success: false, message: 'Title and end date are required.' });
      return;
    }
    const sale = await prisma.flashSale.create({
      data: {
        title,
        description: description || null,
        bannerImage: bannerImage || null,
        discountPercent: Number(discountPercent) || 20,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        productIds: typeof productIds === 'string' ? productIds : JSON.stringify(productIds || [])
      }
    });
    res.status(201).json({ success: true, flashSale: sale });
  } catch (error: any) {
    console.error('createFlashSale error:', error);
    res.status(500).json({ success: false, message: 'Failed to create flash sale.' });
  }
};

export const updateFlashSale = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { title, description, bannerImage, discountPercent, startDate, endDate, productIds, isActive } = req.body;
    const sale = await prisma.flashSale.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(bannerImage !== undefined && { bannerImage }),
        ...(discountPercent !== undefined && { discountPercent: Number(discountPercent) }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(productIds !== undefined && { productIds: typeof productIds === 'string' ? productIds : JSON.stringify(productIds) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });
    res.json({ success: true, flashSale: sale });
  } catch (error: any) {
    console.error('updateFlashSale error:', error);
    res.status(500).json({ success: false, message: 'Failed to update flash sale.' });
  }
};

export const deleteFlashSale = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    await prisma.flashSale.delete({ where: { id } });
    res.json({ success: true, message: 'Flash sale deleted.' });
  } catch (error: any) {
    console.error('deleteFlashSale error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete flash sale.' });
  }
};

export const markAbandonedCartRecovered = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const cart = await prisma.abandonedCart.update({
      where: { id },
      data: { isRecovered: true }
    });
    res.json({ success: true, cart });
  } catch (error: any) {
    console.error('markAbandonedCartRecovered error:', error);
    res.status(500).json({ success: false, message: 'Failed to update abandoned cart.' });
  }
};

