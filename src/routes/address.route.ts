import { Router } from 'express';
import {
  createAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/address.controller';
import { authenticate } from '../utils/jwt';

const router = Router();

router.use(authenticate);

router.get('/', getUserAddresses);
router.post('/', createAddress);
router.patch('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefaultAddress);

export default router;
