import { Response, NextFunction } from 'express';
import { CustomRequest } from './authenticate';

export const authorizeAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
     res.status(403).json({ message: 'Access denied: Admins only' });
     return;
  }
  next();
};
