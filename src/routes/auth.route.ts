import { Router } from 'express';
import { upload } from '../utils/multer';
import { register, login } from '../controllers/auth.controller';

const router = Router();

router.post('/register', upload.single('image'), register);
router.post('/login', login);

export default router;
