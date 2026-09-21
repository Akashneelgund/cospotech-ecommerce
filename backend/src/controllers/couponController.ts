import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, subtotal } = req.body;

    if (!code || subtotal === undefined) {
      res.status(400).json({ success: false, message: 'Coupon code and cart subtotal are required.' });
      return;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
      return;
    }

    if (new Date() > coupon.validUntil) {
      res.status(400).json({ success: false, message: 'This coupon code has expired.' });
      return;
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: 'This coupon has reached its maximum redemption limit.' });
      return;
    }

    const numericSubtotal = Number(subtotal);
    if (numericSubtotal < coupon.minOrderValue) {
      res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required for this coupon.`
      });
      return;
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (numericSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, numericSubtotal);

    res.json({
      success: true,
      message: `Sacred blessing coupon applied! ₹${discount.toLocaleString('en-IN')} saved.`,
      coupon: {
        code: coupon.code,
        discount,
        description: coupon.description
      }
    });
  } catch (error: any) {
    console.error('validateCoupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
  }
};
