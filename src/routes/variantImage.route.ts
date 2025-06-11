import { Router } from 'express';
import {
  createVariantImage,
  getAllVariantImages,
  getVariantImageById,
  updateVariantImage,
  deleteVariantImage,
} from '../controllers/variantImage.controller';
import { upload } from '../upload/multer';
import { uploadMemory } from '../upload/multerCloudinary';
import { authenticate } from '../middlewares/authenticate';
import { authorizeAdmin } from '../middlewares/authorizaAdmin';

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
