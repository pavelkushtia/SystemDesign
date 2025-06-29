import { Request, Response, NextFunction } from 'express';
import { ScaleSimError, ValidationError, NotFoundError, UnauthorizedError } from '@scalesim/shared';
import { logger } from '../utils/logger';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error(`Error in ${req.method} ${req.path}:`, {
    error: error.message,
    stack: error.stack,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Handle known ScaleSim errors
  if (error instanceof ScaleSimError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError' || error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: error.message,
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle JSON parsing errors
  if (error.name === 'SyntaxError' && 'body' in error) {
    res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body',
      code: 'INVALID_JSON',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle database errors
  if (error.message.includes('SQLITE')) {
    res.status(500).json({
      success: false,
      error: 'Database error occurred',
      code: 'DATABASE_ERROR',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle unknown errors
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
} 