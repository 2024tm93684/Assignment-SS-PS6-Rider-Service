import { Request, Response } from 'express';

/**
 * 404 Not Found Middleware
 * Handles requests to routes that don't exist
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

