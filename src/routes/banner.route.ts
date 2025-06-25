import { Router } from 'express';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/banner.controller';
import { uploadMemory } from '../upload/multerCloudinary';
import { authenticate } from '../middlewares/authenticate';
import { authorizeAdmin } from '../middlewares/authorizaAdmin';

const router = Router();

// Public route
router.get('/', getBanners);

// Admin-only routes
router.use(authenticate, authorizeAdmin);
const bannerUpload = uploadMemory.fields([
  { name: 'image', maxCount: 1 },
  { name: 'mobile_banner', maxCount: 1 },
]);
router.post('/', bannerUpload, createBanner);
router.patch('/:id', bannerUpload, updateBanner);
router.delete('/:id', deleteBanner);

export default router;
