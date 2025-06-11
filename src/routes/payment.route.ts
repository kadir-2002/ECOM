import express from 'express';
import { createPayment, updatePayment, getPaymentByOrder, listPayments, getPaymentById } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeAdmin } from '../middlewares/authorizaAdmin';
const router = express.Router();

// Create a payment record for an order
router.post('/', authenticate, createPayment);

// Update payment status (e.g., from webhook or frontend callback)
router.patch('/:id/status', authenticate, authorizeAdmin, updatePayment);

// get payment by id
router.get('/view/:id', authenticate, getPaymentById);

// Get payment details by order ID
router.get('/order/:orderId', authenticate, getPaymentByOrder);

router.get('/history', authenticate, authorizeAdmin, listPayments);


export default router;
