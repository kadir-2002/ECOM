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

router.post('/', uploadMemory.single('image'), createBanner);
router.patch('/:id', uploadMemory.single('image'), updateBanner);
router.delete('/:id', deleteBanner);

export default router;
