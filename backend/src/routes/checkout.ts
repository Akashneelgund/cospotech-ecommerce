import { Router } from 'express';
import { calculateOrder, createOrder, mockPaymentVerification } from '../controllers/checkoutController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/calculate', optionalAuth, calculateOrder);
router.post('/create-order', optionalAuth, createOrder);
router.post('/mock-verify', optionalAuth, mockPaymentVerification);

export default router;
