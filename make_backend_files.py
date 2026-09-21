import os

BASE = r"C:\Users\Akash Neelgund\.gemini\antigravity\scratch\vedic-ecommerce\backend\src"

def write_file(rel_path, code):
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(code)
    print(f"Created: {rel_path}")

# ==================== 1. authController.ts ====================
write_file("controllers/authController.ts", """import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../types/index.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        role: 'CUSTOMER',
        status: 'ACTIVE'
      }
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        addresses: true
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({ success: true, user });
  } catch (error: any) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { name, phone, avatar } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        phone: phone !== undefined ? phone.trim() : undefined,
        avatar: avatar !== undefined ? avatar : undefined
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true
      }
    });

    res.json({ success: true, message: 'Profile updated successfully.', user: updated });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash }
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};
""")

# ==================== 2. routes/auth.ts ====================
write_file("routes/auth.ts", """import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.post('/change-password', requireAuth, changePassword);

export default router;
""")

# ==================== 3. controllers/productController.ts ====================
write_file("controllers/productController.ts", """import { Request, Response } from 'express';
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
        slug: category as string
      };
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { productCode: { contains: q } },
        { description: { contains: q } },
        { category: { name: { contains: q } } }
      ];
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice as string);
    }

    if (size && size !== 'all') {
      where.variants = {
        some: {
          size: { contains: size as string }
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
    const q = (req.query.q as string || '').trim();
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
    const { identifier } = req.params;

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

    // Get related products from the same category
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
    const { id } = req.params;
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
        comment: comment.trim(),
        isVerifiedPurchase: true,
        isApproved: true
      }
    });

    // Update product average rating
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
""")

# ==================== 4. routes/products.ts ====================
write_file("routes/products.ts", """import { Router } from 'express';
import {
  getProducts,
  getSearchSuggestions,
  getFeaturedProducts,
  getBestsellers,
  getCategories,
  getProductBySlugOrCode,
  addProductReview
} from '../controllers/productController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getProducts);
router.get('/search-suggestions', getSearchSuggestions);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestsellers);
router.get('/categories', getCategories);
router.get('/:identifier', getProductBySlugOrCode);
router.post('/:id/reviews', optionalAuth, addProductReview);

export default router;
""")

# ==================== 5. controllers/cartController.ts ====================
write_file("controllers/cartController.ts", """import { Response } from 'express';
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

    // Get or create cart
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

    // Check existing item
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
    const { variantId } = req.params;
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
""")

# ==================== 6. routes/cart.ts ====================
write_file("routes/cart.ts", """import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getCart);
router.post('/add', optionalAuth, addToCart);
router.put('/update', optionalAuth, updateCartItem);
router.delete('/item/:variantId', optionalAuth, removeCartItem);

export default router;
""")

# ==================== 7. controllers/wishlistController.ts ====================
write_file("controllers/wishlistController.ts", """import { Response } from 'express';
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
""")

# ==================== 8. routes/wishlist.ts ====================
write_file("routes/wishlist.ts", """import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getWishlist);
router.post('/toggle', requireAuth, toggleWishlist);

export default router;
""")

# ==================== 9. controllers/couponController.ts ====================
write_file("controllers/couponController.ts", """import { Request, Response } from 'express';
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
""")

# ==================== 10. routes/coupons.ts ====================
write_file("routes/coupons.ts", """import { Router } from 'express';
import { validateCoupon } from '../controllers/couponController.js';

const router = Router();

router.post('/validate', validateCoupon);

export default router;
""")

print("Batch 1 completed!")