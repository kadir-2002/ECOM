import { Router } from 'express';
import { upload } from '../utils/multer';
import { register, login } from '../controllers/auth.controller';
import { uploadMemory } from '../utils/multerCloudinary';

const router = Router();

router.post('/register', uploadMemory.single('image'), register);
router.post('/login', login);

export default router;
