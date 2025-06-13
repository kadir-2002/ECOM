import express from 'express';
import { createOrder, generateInvoicePDF, getOrderById, getSingleOrder, getUserOrders } from '../controllers/order.controller';
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();

router.get('/invoice', generateInvoicePDF);
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);
router.get('/detail/:id', authenticate, getSingleOrder);
export default router;
