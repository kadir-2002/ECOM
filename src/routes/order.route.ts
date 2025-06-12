import express from 'express';
import { createOrder, getOrderById, getUserOrders } from '../controllers/order.controller';
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);

export default router;
