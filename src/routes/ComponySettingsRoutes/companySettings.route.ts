import { Router } from 'express';
import {
  createCompanySettings,
  getAllCompanySettings,
  getCompanySettingsById,
  updateCompanySettings,
  deleteCompanySettings
} from '../../controllers/ComponySettingsControllers/companySettings.controller';

import { authenticate } from '../../middlewares/authenticate';
import { authorizeAdmin } from '../../middlewares/authorizaAdmin';

const router = Router();

// Public access
router.get('/', getAllCompanySettings);
router.get('/:id', getCompanySettingsById);

// Admin only
import { uploadMemory } from '../../upload/multerCloudinary';

router.post(
  '/',
  authenticate,
  authorizeAdmin,
  uploadMemory.single('logo'), // accept one logo file
  createCompanySettings
);

router.patch(
  '/:id',
  authenticate,
  authorizeAdmin,
  uploadMemory.single('logo'),
  updateCompanySettings
);
router.delete('/:id', authenticate, authorizeAdmin, deleteCompanySettings);

export default router;
