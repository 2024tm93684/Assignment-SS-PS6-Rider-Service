import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Global Error Handling Middleware
 * Catches all errors and sends appropriate responses
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Check if it's an AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    // Check for specific error types
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = err.message;
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
    } else if (err.name === 'MongoServerError') {
      // Handle MongoDB duplicate key errors
      if ((err as any).code === 11000) {
        statusCode = 409;
        const field = Object.keys((err as any).keyPattern)[0];
        message = `${field} already exists`;
      }
    }
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Catch async errors wrapper
 * Wraps async route handlers to catch errors and pass them to error handler
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

