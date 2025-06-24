import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { addHeaderData, deleteHeaderData, getHeaders, updateHeaderData } from '../../controllers/HomePageControllers/header.controller';

const router = Router();

router.use(authenticate);

router.get('/', getHeaders);
router.post('/', addHeaderData);
router.patch('/:header_id', updateHeaderData);
router.delete('/:header_id', deleteHeaderData);

export default router;
