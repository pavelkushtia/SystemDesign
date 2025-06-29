import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // Skip logging for health checks and static assets
  if (req.path === '/health' || req.path.startsWith('/static')) {
    return next();
  }

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const userAgent = req.get('User-Agent') || '-';
    const ip = req.ip || req.connection.remoteAddress || '-';

    // Determine log level based on status code
    let level = 'info';
    if (statusCode >= 400 && statusCode < 500) {
      level = 'warn';
    } else if (statusCode >= 500) {
      level = 'error';
    }

    // Create log message
    const message = `${method} ${url} ${statusCode} ${duration}ms - ${ip} - ${userAgent}`;

    // Log with appropriate level
    logger.log(level, message, {
      method,
      url,
      statusCode,
      duration,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
  });

  next();
} 