import { Router } from 'express';
import {
  getActiveFlashSale,
  getRewards,
  getReferralInfo,
  recordAbandonedCart,
  getAbandonedCarts,
  getAllFlashSales,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
  markAbandonedCartRecovered
} from '../controllers/marketingController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/flash-sale', getActiveFlashSale);
router.post('/abandoned-cart', recordAbandonedCart);
router.get('/rewards', requireAuth, getRewards);
router.get('/referral', requireAuth, getReferralInfo);

// Admin
router.get('/admin/abandoned-carts', requireAdmin, getAbandonedCarts);
router.put('/admin/abandoned-carts/:id/recover', requireAdmin, markAbandonedCartRecovered);

router.get('/admin/flash-sales', requireAdmin, getAllFlashSales);
router.post('/admin/flash-sales', requireAdmin, createFlashSale);
router.put('/admin/flash-sales/:id', requireAdmin, updateFlashSale);
router.delete('/admin/flash-sales/:id', requireAdmin, deleteFlashSale);

export default router;
