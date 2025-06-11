// src/middlewares/loginRateLimiter.ts
import rateLimit from 'express-rate-limit';

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 10;

export const loginRateLimiter = rateLimit({
  windowMs: WINDOW_MINUTES * 60 * 1000, // 10 minutes
  max: MAX_ATTEMPTS, // 5 attempts
  keyGenerator: (req) => req.body.email || req.ip, // limit by email first
  handler: (req, res) => {
    res.status(429).json({
      message: `Too many login attempts. Please try again in ${WINDOW_MINUTES} minutes.`,
    });
  },
  standardHeaders: true, // send RateLimit headers
  legacyHeaders: false,
});
