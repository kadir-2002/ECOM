import { Router } from 'express';
import {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
} from '../controllers/passwordReset.controller';

const router = Router();

router.post('/request-reset', requestPasswordReset);  // Send OTP
router.post('/verify-otp', verifyOTP);                // Verify OTP
router.post('/reset-password', resetPassword);        // Reset password

export default router;
