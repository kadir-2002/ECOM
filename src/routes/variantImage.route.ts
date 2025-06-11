import { Router } from 'express';
import {
  createVariantImage,
  getAllVariantImages,
  getVariantImageById,
  updateVariantImage,
  deleteVariantImage,
} from '../controllers/variantImage.controller';
import { authenticate, authorizeAdmin } from '../auth/jwt';
import { upload } from '../upload/multer';
import { uploadMemory } from '../upload/multerCloudinary';

const router = Router();

// Public routes
router.get('/', getAllVariantImages);
router.get('/:variantId', getVariantImageById);

// Admin-only routes
router.use(authenticate, authorizeAdmin);

router.post('/', uploadMemory.array('images', 5), createVariantImage);
router.patch('/:id', uploadMemory.array('images', 5), updateVariantImage);
router.delete('/:id', deleteVariantImage);

export default router;
