import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';
import { invoiceService } from '../services/invoiceService.js';
import { emailService } from '../services/emailService.js';

export const getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { customerEmail: req.user.email }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 }
              }
            }
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, orders });
  } catch (error: any) {
    console.error('getMyOrders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order history.' });
  }
};

export const getOrderDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const identifier = String(req.params.identifier);

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: identifier },
          { orderNumber: identifier }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 }
              }
            }
          }
        },
        payments: true,
        couponUsages: {
          include: { coupon: true }
        }
      }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (req.user && req.user.role === 'CUSTOMER' && order.userId && order.userId !== req.user.id && order.customerEmail !== req.user.email) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.json({ success: true, order });
  } catch (error: any) {
    console.error('getOrderDetails error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

export const cancelOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (order.orderStatus === 'CANCELLED' || order.orderStatus === 'DELIVERED') {
      res.status(400).json({ success: false, message: `Cannot cancel an order that is already ${order.orderStatus.toLowerCase()}.` });
      return;
    }

    if (req.user && req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          orderStatus: 'CANCELLED',
          paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED',
          notes: reason ? `${order.notes || ''} [Cancelled: ${reason}]` : order.notes
        }
      });

      for (const item of order.items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (variant) {
          const newStock = variant.stock + item.quantity;
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: newStock }
          });

          await tx.inventoryTransaction.create({
            data: {
              variantId: item.variantId,
              changeQty: item.quantity,
              previousQty: variant.stock,
              newQty: newStock,
              reason: 'ORDER_CANCELLED',
              referenceId: order.id,
              notes: `Order #${order.orderNumber} cancelled. Restored stock.`,
              createdBy: req.user?.name || 'CUSTOMER'
            }
          });
        }
      }
    });

    emailService.sendStatusUpdate(order, 'CANCELLED').catch(console.error);

    res.json({ success: true, message: 'Order has been cancelled and stock restored.' });
  } catch (error: any) {
    console.error('cancelOrder error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
};

export const getOrderInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }]
      },
      include: { items: true, payments: true }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const invoiceData = invoiceService.generateInvoiceData(order);
    res.json({ success: true, invoice: invoiceData });
  } catch (error: any) {
    console.error('getOrderInvoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice data.' });
  }
};
