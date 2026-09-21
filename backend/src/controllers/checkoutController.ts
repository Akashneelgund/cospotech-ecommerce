import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest, CheckoutPayload } from '../types/index.js';
import { emailService } from '../services/emailService.js';

export const calculateOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { items, couponCode, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Cart items are required for calculation.' });
      return;
    }

    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true }
      });

      if (!variant || !variant.product.isActive) {
        res.status(400).json({ success: false, message: `Product item not found or is inactive.` });
        return;
      }

      if (variant.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${variant.product.name} (${variant.size})". Only ${variant.stock} left.`
        });
        return;
      }

      // True server-side price (never trust frontend price)
      const truePrice = variant.specialPrice && variant.specialPrice > 0 ? variant.specialPrice : variant.price;
      const itemTotal = truePrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        variantId: variant.id,
        productId: variant.productId,
        name: variant.product.name,
        code: variant.product.productCode,
        size: variant.size,
        price: truePrice,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // Coupon calculation
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() }
      });

      if (coupon && coupon.isActive && new Date() <= coupon.validUntil && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }
        discount = Math.min(discount, subtotal);
      }
    }

    // Shipping rules: Free shipping over Rs. 999, else Rs. 99
    const taxableBase = subtotal - discount;
    const shippingFee = taxableBase >= 999 ? 0 : 99;
    const taxAmount = Math.round(taxableBase * 0.03);
    const totalAmount = Math.max(0, taxableBase + shippingFee);

    res.json({
      success: true,
      calculation: {
        subtotal,
        discount,
        shippingFee,
        taxAmount,
        totalAmount,
        itemCount: items.reduce((acc: number, cur: any) => acc + cur.quantity, 0),
        items: validatedItems
      }
    });
  } catch (error: any) {
    console.error('calculateOrder error:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate order details.' });
  }
};

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const payload: CheckoutPayload = req.body;
    const userId = req.user?.id || null;

    if (!payload.customerName || !payload.customerEmail || !payload.customerPhone || !payload.shippingAddress) {
      res.status(400).json({ success: false, message: 'All customer contact and shipping details are required.' });
      return;
    }

    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
      res.status(400).json({ success: false, message: 'Your sacred cart is empty.' });
      return;
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToCreate: any[] = [];
      const stockUpdates: any[] = [];

      // 1. Verify items and inventory
      for (const item of payload.items!) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true }
        });

        if (!variant || !variant.product.isActive) {
          throw new Error(`Item ${item.variantId} is no longer available.`);
        }

        if (variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${variant.product.name} (${variant.size})". Only ${variant.stock} available.`);
        }

        const truePrice = variant.specialPrice && variant.specialPrice > 0 ? variant.specialPrice : variant.price;
        const lineTotal = truePrice * item.quantity;
        subtotal += lineTotal;

        orderItemsToCreate.push({
          productId: variant.productId,
          variantId: variant.id,
          productName: variant.product.name,
          productCode: variant.product.productCode,
          size: variant.size,
          price: truePrice,
          quantity: item.quantity,
          total: lineTotal
        });

        stockUpdates.push({
          variantId: variant.id,
          qtyToDeduct: item.quantity,
          currentStock: variant.stock
        });
      }

      // 2. Validate coupon
      let discount = 0;
      let appliedCoupon: any = null;
      if (payload.couponCode) {
        appliedCoupon = await tx.coupon.findUnique({
          where: { code: payload.couponCode.trim().toUpperCase() }
        });

        if (appliedCoupon && appliedCoupon.isActive && new Date() <= appliedCoupon.validUntil && subtotal >= appliedCoupon.minOrderValue) {
          if (appliedCoupon.discountType === 'PERCENTAGE') {
            discount = (subtotal * appliedCoupon.discountValue) / 100;
            if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
              discount = appliedCoupon.maxDiscount;
            }
          } else {
            discount = appliedCoupon.discountValue;
          }
          discount = Math.min(discount, subtotal);
        }
      }

      const taxableBase = subtotal - discount;
      const shippingFee = taxableBase >= 999 ? 0 : 99;
      const taxAmount = Math.round(taxableBase * 0.03);
      const totalAmount = Math.max(0, taxableBase + shippingFee);

      // Generate Order Number
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `VEDA-${new Date().getFullYear()}-${randomSuffix}`;

      // 3. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: payload.customerName.trim(),
          customerEmail: payload.customerEmail.toLowerCase().trim(),
          customerPhone: payload.customerPhone.trim(),
          shippingAddress: JSON.stringify(payload.shippingAddress),
          billingAddress: JSON.stringify(payload.billingAddress || payload.shippingAddress),
          subtotal,
          discount,
          taxAmount,
          shippingFee,
          totalAmount,
          paymentMethod: payload.paymentMethod || 'MOCK',
          paymentStatus: payload.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          orderStatus: 'CONFIRMED',
          trackingNumber: `VEDA-TRK-${Date.now().toString().slice(-6)}`,
          courierName: 'Vedic Express Insured Logistics',
          notes: payload.notes || null,
          items: {
            create: orderItemsToCreate
          }
        },
        include: {
          items: true
        }
      });

      // 4. Atomically deduct stock
      for (const update of stockUpdates) {
        const newStock = update.currentStock - update.qtyToDeduct;

        await tx.productVariant.update({
          where: { id: update.variantId },
          data: { stock: newStock }
        });

        await tx.inventoryTransaction.create({
          data: {
            variantId: update.variantId,
            changeQty: -update.qtyToDeduct,
            previousQty: update.currentStock,
            newQty: newStock,
            reason: 'ORDER_PLACED',
            referenceId: order.id,
            notes: `Order #${order.orderNumber} placed by ${payload.customerName}`,
            createdBy: 'CUSTOMER_CHECKOUT'
          }
        });
      }

      // 5. Payment entry
      const transactionId = `TXN-${payload.paymentMethod}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await tx.payment.create({
        data: {
          orderId: order.id,
          transactionId,
          provider: payload.paymentMethod || 'MOCK',
          amount: totalAmount,
          status: payload.paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
          details: JSON.stringify({
            paymentMethod: payload.paymentMethod,
            timestamp: new Date().toISOString(),
            status: 'SUCCESS'
          })
        }
      });

      // 6. Record coupon usage
      if (appliedCoupon && discount > 0) {
        await tx.couponUsage.create({
          data: {
            couponId: appliedCoupon.id,
            userId,
            orderId: order.id,
            discountApplied: discount
          }
        });

        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      // 7. Clear user cart if authenticated
      if (userId) {
        const userCart = await tx.cart.findUnique({ where: { userId } });
        if (userCart) {
          await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
        }
      }

      return order;
    });

    emailService.sendOrderConfirmation(createdOrder).catch(err => {
      console.error('Failed to send confirmation email:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Sacred order placed successfully!',
      order: createdOrder
    });
  } catch (error: any) {
    console.error('createOrder error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to place order.' });
  }
};

export const mockPaymentVerification = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const transactionId = `TXN-VERIFIED-${Date.now()}`;
    res.json({
      success: true,
      verified: true,
      transactionId,
      message: 'Test payment verified and recorded successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Mock payment verification failed.' });
  }
};
