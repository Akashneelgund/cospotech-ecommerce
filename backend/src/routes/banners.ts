import { Router } from 'express';
import {
  getAnnouncements,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/bannerController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/announcements', getAnnouncements);
router.post('/announcements', requireAdmin, createAnnouncement);
router.put('/announcements/:id', requireAdmin, updateAnnouncement);
router.delete('/announcements/:id', requireAdmin, deleteAnnouncement);

router.get('/', getBanners);
router.post('/', requireAdmin, createBanner);
router.put('/:id', requireAdmin, updateBanner);
router.delete('/:id', requireAdmin, deleteBanner);

export default router;
