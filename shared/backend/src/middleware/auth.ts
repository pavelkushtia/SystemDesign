import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, UnauthorizedError, ForbiddenError } from '@scalesim/shared';
import { database } from '../database/index';
import { logger } from '../utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

// JWT Secret - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'scalesim-dev-refresh-secret';

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

// ============================================================================
// JWT TOKEN UTILITIES
// ============================================================================

export function generateAccessToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    type: 'access'
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '15m',
    issuer: 'scalesim',
    audience: 'scalesim-api'
  });
}

export function generateRefreshToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    type: 'refresh'
  };
  
  return jwt.sign(payload, JWT_REFRESH_SECRET, { 
    expiresIn: '7d',
    issuer: 'scalesim',
    audience: 'scalesim-api'
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'scalesim',
      audience: 'scalesim-api'
    }) as JWTPayload;
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    logger.warn('Access token verification failed:', error);
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'scalesim',
      audience: 'scalesim-api'
    }) as JWTPayload;
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    logger.warn('Refresh token verification failed:', error);
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Middleware to authenticate requests using JWT tokens
 * Adds user object to request if authentication is successful
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    next(new UnauthorizedError('Access token required'));
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    
    // Get user from database
    const userStmt = database.prepare('SELECT * FROM users WHERE id = ?');
    const user = userStmt.get(decoded.userId) as User | undefined;
    
    if (!user) {
      next(new UnauthorizedError('User not found'));
      return;
    }
    
    // Add user to request object
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Adds user to request if token is present and valid, but doesn't fail if missing
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    
    const userStmt = database.prepare('SELECT * FROM users WHERE id = ?');
    const user = userStmt.get(decoded.userId) as User | undefined;
    
    if (user) {
      req.user = user;
      req.userId = user.id;
    }
  } catch (error) {
    // Log the error but don't fail the request
    logger.warn('Optional authentication failed:', error);
  }
  
  next();
}

/**
 * Middleware to require authentication
 * Throws error if user is not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }
  
  next();
}

/**
 * Middleware to check if user owns a resource
 * Used for protecting user-specific resources
 */
export function requireOwnership(resourceTable: string, resourceIdParam: string = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    const resourceId = req.params[resourceIdParam];
    
    try {
      const stmt = database.prepare(`SELECT user_id FROM ${resourceTable} WHERE id = ?`);
      const resource = stmt.get(resourceId) as { user_id: string } | undefined;
      
      if (!resource) {
        next(new Error(`Resource not found`));
        return;
      }
      
      if (resource.user_id !== req.user.id) {
        next(new ForbiddenError('Access denied: You do not own this resource'));
        return;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check system access (owner, collaborator, or public)
 * Used for protecting system-specific resources
 */
export function requireSystemAccess(req: Request, res: Response, next: NextFunction): void {
  const systemId = req.params.systemId || req.params.id;
  
  if (!systemId) {
    next(new Error('System ID required'));
    return;
  }

  try {
    // Get system visibility and ownership
    const systemStmt = database.prepare('SELECT user_id, visibility FROM systems WHERE id = ?');
    const system = systemStmt.get(systemId) as { user_id: string; visibility: string } | undefined;
    
    if (!system) {
      next(new Error('System not found'));
      return;
    }
    
    // Public systems are accessible to everyone
    if (system.visibility === 'public') {
      next();
      return;
    }
    
    // Private/unlisted systems require authentication
    if (!req.user) {
      next(new UnauthorizedError('Authentication required for private systems'));
      return;
    }
    
    // Check if user is the owner
    if (system.user_id === req.user.id) {
      next();
      return;
    }
    
    // Check if user is a collaborator
    const collaboratorStmt = database.prepare(`
      SELECT role FROM project_collaborators 
      WHERE system_id = ? AND user_id = ?
    `);
    const collaboration = collaboratorStmt.get(systemId, req.user.id) as { role: string } | undefined;
    
    if (collaboration) {
      next();
      return;
    }
    
    // No access
    next(new ForbiddenError('Access denied: You do not have access to this system'));
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to check if user can modify a system
 * Requires owner or admin/collaborator role
 */
export function requireSystemModifyAccess(req: Request, res: Response, next: NextFunction): void {
  const systemId = req.params.systemId || req.params.id;
  
  if (!req.user) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }

  try {
    // Get system ownership
    const systemStmt = database.prepare('SELECT user_id FROM systems WHERE id = ?');
    const system = systemStmt.get(systemId) as { user_id: string } | undefined;
    
    if (!system) {
      next(new Error('System not found'));
      return;
    }
    
    // Check if user is the owner
    if (system.user_id === req.user.id) {
      next();
      return;
    }
    
    // Check if user is a collaborator with modify permissions
    const collaboratorStmt = database.prepare(`
      SELECT role FROM project_collaborators 
      WHERE system_id = ? AND user_id = ? AND role IN ('admin', 'collaborator')
    `);
    const collaboration = collaboratorStmt.get(systemId, req.user.id) as { role: string } | undefined;
    
    if (collaboration) {
      next();
      return;
    }
    
    // No modify access
    next(new ForbiddenError('Access denied: You do not have permission to modify this system'));
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Store refresh token in database
 */
export async function storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const stmt = database.prepare(`
    INSERT INTO user_sessions (id, user_id, refresh_token, expires_at)
    VALUES (?, ?, ?, ?)
  `);

  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  stmt.run(sessionId, userId, refreshToken, expiresAt.toISOString());
}

/**
 * Validate refresh token from database
 */
export async function validateRefreshToken(refreshToken: string): Promise<User | null> {
  try {
    // Verify JWT first
    const decoded = verifyRefreshToken(refreshToken);
    
    // Check if token exists in database and is not expired
    const sessionStmt = database.prepare(`
      SELECT s.user_id, u.* 
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.refresh_token = ? AND s.expires_at > datetime('now')
    `);
    
    const result = sessionStmt.get(refreshToken) as User | undefined;
    
    return result || null;
  } catch (error) {
    logger.warn('Refresh token validation failed:', error);
    return null;
  }
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const stmt = database.prepare('DELETE FROM user_sessions WHERE refresh_token = ?');
  stmt.run(refreshToken);
}

/**
 * Revoke all user sessions
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  const stmt = database.prepare('DELETE FROM user_sessions WHERE user_id = ?');
  stmt.run(userId);
}

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

/**
 * Log user activity
 */
export function logUserActivity(
  userId: string,
  activityType: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, any>
): void {
  try {
    const stmt = database.prepare(`
      INSERT INTO user_activities (id, user_id, activity_type, resource_type, resource_id, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const activityId = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    stmt.run(
      activityId,
      userId,
      activityType,
      resourceType,
      resourceId,
      JSON.stringify(metadata || {})
    );
  } catch (error) {
    logger.warn('Failed to log user activity:', error);
  }
}

/**
 * Middleware to automatically log user activities
 */
export function autoLogActivity(activityType: string, resourceType: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user) {
      const resourceId = req.params.id || req.params.systemId || 'unknown';
      const metadata = {
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent')
      };
      
      logUserActivity(req.user.id, activityType, resourceType, resourceId, metadata);
    }
    
    next();
  };
} 