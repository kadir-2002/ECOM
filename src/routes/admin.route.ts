import { Router } from 'express';
import {
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  getAllUsers,
  exportUsersToCsv,
  exportProductsToCsv,
  importProductsFromCSV,
  exportVariantsToCSV,
  importVariantsFromCSV,
} from '../controllers/admin.controller';
import { authenticate, authorizeAdmin } from '../utils/jwt';
import { upload } from '../utils/multer';
import { uploadCsv } from '../utils/multerCsv';
import { uploadMemory } from '../utils/multerCloudinary';

const router = Router();

router.use(authenticate, authorizeAdmin);

// router.post('/create', upload.single('image'), createUserByAdmin);
router.post('/create', uploadMemory.single('image'), createUserByAdmin);
router.patch('/update/:id', uploadMemory.single('image'), updateUserByAdmin);
router.delete('/delete/:id', deleteUserByAdmin);
router.get('/userlist', getAllUsers);
router.get('/export/users', exportUsersToCsv);
router.get('/export/products', exportProductsToCsv);
router.get('/export/variants', exportVariantsToCSV);
router.post('/import/products', uploadCsv.single('file'), importProductsFromCSV);
router.post('/import/variants', uploadCsv.single('file'), importVariantsFromCSV);

export default router;
