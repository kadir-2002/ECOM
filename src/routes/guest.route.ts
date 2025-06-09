import express from 'express';
import { guestCheckout } from '../controllers/guest.controller';

const router = express.Router();

router.post('/checkout', guestCheckout);

export default router;
