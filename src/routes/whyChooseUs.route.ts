import express from 'express';
import {
  createWhyChooseUsItem,
  getAllWhyChooseUsItems,
  getWhyChooseUsItemById,
  updateWhyChooseUsItem,
  deleteWhyChooseUsItem,
} from '../controllers/whyChooseUs.controller';

import { uploadMemory } from '../upload/multerCloudinary'; // adjust path
import { authenticate } from '../middlewares/authenticate';
import { authorizeAdmin } from '../middlewares/authorizaAdmin';

const router = express.Router();

router.get('/', getAllWhyChooseUsItems);
router.get('/:id', getWhyChooseUsItemById);
router.use(authenticate, authorizeAdmin);
router.post('/', uploadMemory.single('image'), createWhyChooseUsItem);
router.put('/:id', uploadMemory.single('image'), updateWhyChooseUsItem);
router.delete('/:id', deleteWhyChooseUsItem);

export default router;
