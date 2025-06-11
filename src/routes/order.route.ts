import express from 'express';
import { createOrder, getUserOrders } from '../controllers/order.controller';
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getUserOrders);

export default router;
