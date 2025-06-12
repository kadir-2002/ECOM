import { Router } from 'express';
import {
  getUserDiscountCodes,
  redeemDiscountCode,
  getAllDiscountCodes,
} from '../controllers/discountCode.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeAdmin } from '../middlewares/authorizaAdmin';

const router = Router();

// User-only route to view their codes
router.use(authenticate);
router.get('/mine', getUserDiscountCodes);

// User redeeming code
router.post('/redeem', redeemDiscountCode);

// Admin route to view all codes
router.use(authorizeAdmin);
router.get('/', getAllDiscountCodes);

export default router;
