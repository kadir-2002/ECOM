import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { addHeaderData, deleteHeaderData, getHeaders, updateHeaderData } from '../../controllers/HomePageControllers/header.controller';
import { authorizeAdmin } from '../../middlewares/authorizaAdmin';

const router = Router();


router.get('/', getHeaders);
router.use(authenticate,authorizeAdmin);
router.post('/', addHeaderData);
router.patch('/:header_id', updateHeaderData);
router.delete('/:header_id', deleteHeaderData);

export default router;
