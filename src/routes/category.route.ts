import { Router } from 'express';
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoryBySlug,
  softDeleteCategory,
  restoreCategory,
} from '../controllers/category.controller';
import subcategoryRoutes from './subcategory.route';
import { authenticate } from '../middlewares/authenticate';
import { authorizeAdmin } from '../middlewares/authorizaAdmin';
const router = Router();

//public route
router.get('/', getAllCategories);
router.get('/info/:slug', getCategoryBySlug);

router.use('/subcategory', subcategoryRoutes);


//admin route
router.use(authenticate, authorizeAdmin);

router.post('/', createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.patch('/deactivate/:id', softDeleteCategory);
router.patch('/restore/:id', restoreCategory);

export default router;
