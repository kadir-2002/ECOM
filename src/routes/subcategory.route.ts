import { Router } from 'express';
import {
  createSubcategory,
  getAllSubcategories,
  getSubcategoryBySlug,
  updateSubcategory,
  deleteSubcategory,
  restoreSubcategory,
  softDeleteSubcategory,
} from '../controllers/subcategory.controller';
import { authenticate,authorizeAdmin } from '../auth/jwt';

const router = Router();

// Public routes
router.get('/', getAllSubcategories);
router.get('/:slug', getSubcategoryBySlug);

// Admin-only routes
router.use(authenticate,authorizeAdmin);

router.post('/', createSubcategory);
router.patch('/:id', updateSubcategory);
router.delete('/:id', deleteSubcategory);

router.patch('/deactivate/:id', authenticate, softDeleteSubcategory);
router.patch('/restore/:id', authenticate, restoreSubcategory);

export default router;
