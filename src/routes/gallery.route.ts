import { Router } from 'express';
import {
  createGalleryItem,
  getAllGalleryItems,
  deleteGalleryItem,
} from '../controllers/gallery.controller';
import { uploadMemory } from '../upload/multerCloudinary';

const router = Router();

router.get('/', getAllGalleryItems);
router.post('/', uploadMemory.single('image'), createGalleryItem);
router.delete('/:id', deleteGalleryItem);

export default router;
