import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductBySlug,
  softDeleteProduct,
  restoreProduct,
} from '../controllers/product.controller';
import { upload } from '../upload/multer';

import variantRoutes from './variant.route';
import { authenticate } from '../middlewares/authenticate';
import { authorizeAdmin } from '../middlewares/authorizaAdmin';
import { uploadMemory } from '../upload/multerCloudinary';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/info/:slug', getProductBySlug);

router.use('/:id/variant', variantRoutes);

// Admin-only routes
router.use(authenticate, authorizeAdmin);

router.post('/', uploadMemory.single('image'), createProduct);
router.patch('/:id', uploadMemory.single('image'), updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/deactivate/:id', softDeleteProduct);
router.patch('/restore/:id', restoreProduct);

export default router;
