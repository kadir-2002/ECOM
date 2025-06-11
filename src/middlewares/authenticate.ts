import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

export interface CustomRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Token ')) {
     res.status(401).json({ message: 'Authorization header missing or malformed' });
     return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
