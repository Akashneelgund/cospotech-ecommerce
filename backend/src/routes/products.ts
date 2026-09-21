import { Router } from 'express';
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
