import { Router } from 'express';
import {
  createVariantImage,
  getAllVariantImages,
  getVariantImageById,
  updateVariantImage,
  deleteVariantImage,
} from '../controllers/variantImage.controller';
import { authenticate, authorizeAdmin } from '../utils/jwt';
import { upload } from '../utils/multer';

const router = Router();

// Public routes
router.get('/', getAllVariantImages);
router.get('/:variantId', getVariantImageById);

// Admin-only routes
router.use(authenticate, authorizeAdmin);

router.post('/', upload.array('images', 5), createVariantImage);
router.patch('/:id', upload.array('images', 5), updateVariantImage);
router.delete('/:id', deleteVariantImage);

export default router;
