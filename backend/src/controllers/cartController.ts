import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const sessionId = (req.headers['x-session-id'] as string) || undefined;

    let cart: any = null;

    if (userId) {
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { where: { isPrimary: true }, take: 1 }
                    }
                  }
                }
              }
            }
          }
        }
      });
    } else if (sessionId) {
      cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { where: { isPrimary: true }, take: 1 }
                    }
                  }
                }
              }
            }
          }
        }
      });
    }

    if (!cart) {
      res.json({ success: true, items: [], subtotal: 0, totalItems: 0 });
      return;
    }

    let subtotal = 0;
    let totalItems = 0;

    const formattedItems = cart.items.map((item: any) => {
      const price = item.variant.specialPrice || item.variant.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      totalItems += item.quantity;

      return {
        id: item.id,
        variantId: item.variantId,
        productId: item.variant.productId,
        name: item.variant.product.name,
        code: item.variant.product.productCode,
        size: item.variant.size,
        sku: item.variant.sku,
        price,
        originalPrice: item.variant.price,
        stock: item.variant.stock,
        quantity: item.quantity,
        total: itemTotal,
        image: item.variant.product.images[0]?.url || ''
      };
    });

    res.json({
      success: true,
      cartId: cart.id,
      items: formattedItems,
      subtotal,
      totalItems
    });
  } catch (error: any) {
    console.error('getCart error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { variantId, quantity = 1 } = req.body;
    const userId = req.user?.id;
    const sessionId = (req.headers['x-session-id'] as string) || (userId ? undefined : 'guest-' + Date.now());

    if (!variantId) {
      res.status(400).json({ success: false, message: 'Variant ID is required.' });
      return;
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true }
    });

    if (!variant || !variant.product.isActive) {
      res.status(404).json({ success: false, message: 'Sacred item is no longer available.' });
      return;
    }

    if (variant.stock <= 0) {
      res.status(400).json({ success: false, message: 'Item is currently out of stock.' });
      return;
    }

    let cart: any = null;
    if (userId) {
      cart = await prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId }
      });
    } else {
      cart = await prisma.cart.upsert({
        where: { sessionId: sessionId! },
        update: {},
        create: { sessionId: sessionId! }
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId
        }
      }
    });

    const newQty = (existingItem?.quantity || 0) + Number(quantity);

    if (newQty > variant.stock) {
      res.status(400).json({
        success: false,
        message: `Only ${variant.stock} units available in stock.`
      });
      return;
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity: Number(quantity)
        }
      });
    }

    res.json({ success: true, message: 'Added to sacred cart.' });
  } catch (error: any) {
    console.error('addToCart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { variantId, quantity } = req.body;

    if (!variantId || quantity === undefined) {
      res.status(400).json({ success: false, message: 'Variant ID and quantity are required.' });
      return;
    }

    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) {
      res.status(404).json({ success: false, message: 'Item not found.' });
      return;
    }

    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;

    const cart = userId
      ? await prisma.cart.findUnique({ where: { userId } })
      : await prisma.cart.findUnique({ where: { sessionId } });

    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found.' });
      return;
    }

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, variantId }
      });
      res.json({ success: true, message: 'Item removed from cart.' });
      return;
    }

    if (quantity > variant.stock) {
      res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${variant.stock}).`
      });
      return;
    }

    await prisma.cartItem.update({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId
        }
      },
      data: { quantity }
    });

    res.json({ success: true, message: 'Cart updated.' });
  } catch (error: any) {
    console.error('updateCartItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart.' });
  }
};

export const removeCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const variantId = String(req.params.variantId);
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;

    const cart = userId
      ? await prisma.cart.findUnique({ where: { userId } })
      : await prisma.cart.findUnique({ where: { sessionId } });

    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found.' });
      return;
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, variantId }
    });

    res.json({ success: true, message: 'Item removed.' });
  } catch (error: any) {
    console.error('removeCartItem error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove cart item.' });
  }
};
