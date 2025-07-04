import { Router } from 'express';
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  softDeleteCategory,
  restoreCategory,
  getCategoryById,
} from '../controllers/category.controller';

import subcategoryRoutes from './subcategory.route';
import { authenticate } from '../middlewares/authenticate';
import { authorizeAdmin } from '../middlewares/authorizaAdmin';
import { uploadMemory } from '../upload/multerCloudinary';

const router = Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
// Nested subcategory routes
router.use('/subcategory', subcategoryRoutes);

// Admin-only routes
router.use(authenticate, authorizeAdmin);

// Handle image and banner uploads
const categoryUpload = uploadMemory.fields([
  { name: 'image', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

router.post('/', categoryUpload, createCategory);
router.patch('/:id', categoryUpload, updateCategory);
router.delete('/:id', deleteCategory);
router.patch('/deactivate/:id', softDeleteCategory);
router.patch('/restore/:id', restoreCategory);

export default router;
