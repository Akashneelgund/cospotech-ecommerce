import { Router } from 'express';
import { getMyOrders, getOrderDetails, cancelOrder, getOrderInvoice } from '../controllers/orderController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/my-orders', requireAuth, getMyOrders);
router.get('/:identifier', optionalAuth, getOrderDetails);
router.get('/:id/invoice', optionalAuth, getOrderInvoice);
router.post('/:id/cancel', optionalAuth, cancelOrder);

export default router;
