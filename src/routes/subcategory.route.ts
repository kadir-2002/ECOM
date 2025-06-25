import { Router } from 'express';
import {
  createSubcategory,
  getAllSubcategories,
  updateSubcategory,
  deleteSubcategory,
  restoreSubcategory,
  softDeleteSubcategory,
  getSubcategoryById,
} from '../controllers/subcategory.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeAdmin } from '../middlewares/authorizaAdmin';
import { uploadMemory } from '../upload/multerCloudinary';

const router = Router();

router.get('/', getAllSubcategories);
router.get('/detail/:id', getSubcategoryById); 

router.use(authenticate, authorizeAdmin);

const fileUploadMiddleware = uploadMemory.fields([
  { name: 'image', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

router.post('/', fileUploadMiddleware, createSubcategory);
router.patch('/:id', fileUploadMiddleware, updateSubcategory);
router.delete('/:id', deleteSubcategory);
router.patch('/deactivate/:id', softDeleteSubcategory);
router.patch('/restore/:id', restoreSubcategory);

export default router;
