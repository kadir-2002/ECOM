import { Router } from 'express';
import {
  changePassword,
  deleteOwnAccount,
  getMe,
  restoreOwnAccount,
  softDeleteOwnAccount,
  updateOwnProfile
} from '../controllers/user.controller';

import { authenticate } from '../middlewares/authenticate';
import { uploadMemory } from '../upload/multerCloudinary';


const router = Router();

router.use(authenticate);

// User-specific routes
router.delete('/delete', deleteOwnAccount);
router.patch('/deactivate', softDeleteOwnAccount);
router.patch('/restore', restoreOwnAccount);
router.patch('/update', uploadMemory.single('image'), updateOwnProfile);
router.patch('/change-password', changePassword);
router.get('/details', getMe);

export default router;
