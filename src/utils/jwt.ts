import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

interface JwtPayload {
  userId: number;
  role: 'USER' | 'ADMIN';
}
export interface CustomRequest extends Request {
  user?: JwtPayload;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const authenticate = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Authorization header missing' });
    return;
  }

  if (!authHeader.startsWith('Token ')) {
    res.status(401).json({ message: 'Authorization header should starts with "Token "' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    console.log('✅ Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
  console.log('🔐 User role at authorizeAdmin:', req.user?.role);
  if (req.user?.role !== 'ADMIN') {
     res.status(403).json({ message: 'Access denied: Admins only' });
     return;
  }
  next();
};
