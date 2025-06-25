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
router.post('/', authenticate, authorizeAdmin, createCompanySettings);
router.patch('/:id', authenticate, authorizeAdmin, updateCompanySettings);
router.delete('/:id', authenticate, authorizeAdmin, deleteCompanySettings);

export default router;
