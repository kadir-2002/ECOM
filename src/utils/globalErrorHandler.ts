import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorMsg';
 
export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = (err instanceof AppError && err.statusCode) || 500;
  const message = err.message || 'Internal Server Error';
 
  console.error('[ERROR]', err);
 

  res.status(statusCode).json({
    status: 'error',
    message,
  });
};