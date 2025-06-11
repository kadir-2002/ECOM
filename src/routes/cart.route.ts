import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cart.controller';
import { authenticate } from '../auth/jwt';

const router = Router();


router.use(authenticate)

router.get('/', getCart);                          // Get current user's cart
router.post('/add', addToCart);                    // Add item to cart
router.put('/update/:itemId', updateCartItem);     // Update quantity
router.delete('/remove/:itemId', removeCartItem);  // Remove a specific item
router.delete('/clear', clearCart);                // Clear entire cart

export default router;
