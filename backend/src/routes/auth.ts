import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  LoginRequestSchema,
  RegisterRequestSchema,
  validateData, 
  generateId, 
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  ApiResponse 
} from '@scalesim/shared';
import { database } from '../database/index';
import { logger } from '../utils/logger';
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserSessions,
  authenticateToken,
  logUserActivity
} from '../middleware/auth';

const router = Router();

// ============================================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

// POST /api/auth/register - Register with email and password
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request data
    const registrationData = validateData(RegisterRequestSchema, req.body);
    
    // Check if user already exists
    const existingUserStmt = database.prepare('SELECT id FROM users WHERE email = ?');
    const existingUser = existingUserStmt.get(registrationData.email);
    
    if (existingUser) {
      next(new ValidationError('User with this email already exists', []));
      return;
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(registrationData.password, saltRounds);
    
    // Create user
    const userId = generateId();
    const now = new Date().toISOString();
    
    const insertUserStmt = database.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertUserStmt.run(
      userId,
      registrationData.email,
      passwordHash,
      registrationData.first_name,
      registrationData.last_name,
      false, // Email verification required
      now,
      now
    );
    
    // Create user preferences
    const insertPreferencesStmt = database.prepare(`
      INSERT INTO user_preferences (user_id, created_at, updated_at)
      VALUES (?, ?, ?)
    `);
    
    insertPreferencesStmt.run(userId, now, now);
    
    // Get created user
    const userStmt = database.prepare('SELECT * FROM users WHERE id = ?');
    const user = userStmt.get(userId) as User;
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token
    await storeRefreshToken(userId, refreshToken);
    
    // Log activity
    logUserActivity(userId, 'create', 'user', userId, {
      registration_method: 'email_password'
    });
    
    logger.info(`User registered: ${user.email}`);
    
    const response: AuthResponse = {
      success: true,
      user: {
        ...user,
        password_hash: undefined // Don't send password hash to client
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 15 * 60, // 15 minutes
      message: 'Registration successful'
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login - Login with email and password
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request data
    const loginData = validateData(LoginRequestSchema, req.body);
    
    // Get user by email
    const userStmt = database.prepare('SELECT * FROM users WHERE email = ?');
    const user = userStmt.get(loginData.email) as User | undefined;
    
    if (!user || !user.password_hash) {
      next(new UnauthorizedError('Invalid email or password'));
      return;
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(loginData.password, user.password_hash);
    
    if (!passwordValid) {
      next(new UnauthorizedError('Invalid email or password'));
      return;
    }
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);
    
    // Log activity
    logUserActivity(user.id, 'update', 'user', user.id, {
      login_method: 'email_password',
      remember_me: loginData.remember_me || false
    });
    
    logger.info(`User logged in: ${user.email}`);
    
    const response: AuthResponse = {
      success: true,
      user: {
        ...user,
        password_hash: undefined // Don't send password hash to client
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 15 * 60, // 15 minutes
      message: 'Login successful'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout - Logout and invalidate refresh token
router.post('/logout', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.body.refresh_token;
    
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    
    // Log activity
    if (req.user) {
      logUserActivity(req.user.id, 'update', 'user', req.user.id, {
        action: 'logout'
      });
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh - Refresh access token using refresh token
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      next(new UnauthorizedError('Refresh token required'));
      return;
    }
    
    // Validate refresh token
    const user = await validateRefreshToken(refresh_token);
    
    if (!user) {
      next(new UnauthorizedError('Invalid or expired refresh token'));
      return;
    }
    
    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Revoke old refresh token and store new one
    await revokeRefreshToken(refresh_token);
    await storeRefreshToken(user.id, newRefreshToken);
    
    const response: AuthResponse = {
      success: true,
      user: {
        ...user,
        password_hash: undefined
      },
      access_token: accessToken,
      refresh_token: newRefreshToken,
      expires_in: 15 * 60,
      message: 'Token refreshed successfully'
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PASSWORD RESET
// ============================================================================

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      next(new ValidationError('Email is required', []));
      return;
    }
    
    // Check if user exists
    const userStmt = database.prepare('SELECT * FROM users WHERE email = ?');
    const user = userStmt.get(email) as User | undefined;
    
    // Always return success to prevent email enumeration
    const response: ApiResponse = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      timestamp: new Date()
    };
    
    if (user) {
      // TODO: Implement email sending with reset token
      // For now, just log the request
      logger.info(`Password reset requested for: ${email}`);
      
      logUserActivity(user.id, 'update', 'user', user.id, {
        action: 'password_reset_requested'
      });
    }
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      next(new ValidationError('Token and password are required', []));
      return;
    }
    
    if (password.length < 6) {
      next(new ValidationError('Password must be at least 6 characters', []));
      return;
    }
    
    // TODO: Implement token validation and password reset
    // For now, return not implemented
    next(new Error('Password reset not implemented yet'));
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// OAUTH AUTHENTICATION (PLACEHOLDERS)
// ============================================================================

// GET /api/auth/oauth/:provider - Initiate OAuth flow
router.get('/oauth/:provider', (req: Request, res: Response, next: NextFunction) => {
  const { provider } = req.params;
  
  if (!['google', 'github', 'linkedin', 'facebook'].includes(provider)) {
    next(new ValidationError('Invalid OAuth provider', []));
    return;
  }
  
  // TODO: Implement OAuth initiation
  // For now, return not implemented
  res.status(501).json({
    success: false,
    message: `OAuth authentication with ${provider} is not implemented yet`,
    timestamp: new Date()
  });
});

// GET /api/auth/oauth/:provider/callback - OAuth callback handler
router.get('/oauth/:provider/callback', (req: Request, res: Response, next: NextFunction) => {
  const { provider } = req.params;
  
  // TODO: Implement OAuth callback handling
  // For now, return not implemented
  res.status(501).json({
    success: false,
    message: `OAuth callback for ${provider} is not implemented yet`,
    timestamp: new Date()
  });
});

// POST /api/auth/oauth/link - Link OAuth account to existing user
router.post('/oauth/link', authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement OAuth account linking
  // For now, return not implemented
  res.status(501).json({
    success: false,
    message: 'OAuth account linking is not implemented yet',
    timestamp: new Date()
  });
});

// ============================================================================
// USER PROFILE ROUTES
// ============================================================================

// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      next(new UnauthorizedError('User not found'));
      return;
    }
    
    // Get user preferences
    const preferencesStmt = database.prepare('SELECT * FROM user_preferences WHERE user_id = ?');
    const preferences = preferencesStmt.get(req.user.id);
    
    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          ...req.user,
          password_hash: undefined
        },
        preferences
      },
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      next(new UnauthorizedError('User not found'));
      return;
    }
    
    const { first_name, last_name, avatar_url } = req.body;
    const now = new Date().toISOString();
    
    // Update user profile
    const updateUserStmt = database.prepare(`
      UPDATE users SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        avatar_url = COALESCE(?, avatar_url),
        updated_at = ?
      WHERE id = ?
    `);
    
    updateUserStmt.run(first_name, last_name, avatar_url, now, req.user.id);
    
    // Get updated user
    const userStmt = database.prepare('SELECT * FROM users WHERE id = ?');
    const updatedUser = userStmt.get(req.user.id) as User;
    
    // Log activity
    logUserActivity(req.user.id, 'update', 'user', req.user.id, {
      action: 'profile_updated',
      fields_updated: Object.keys(req.body)
    });
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...updatedUser,
        password_hash: undefined
      },
      message: 'Profile updated successfully',
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/preferences - Get user preferences
router.get('/preferences', authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      next(new UnauthorizedError('User not found'));
      return;
    }
    
    const preferencesStmt = database.prepare('SELECT * FROM user_preferences WHERE user_id = ?');
    const preferences = preferencesStmt.get(req.user.id);
    
    const response: ApiResponse = {
      success: true,
      data: preferences,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/preferences - Update user preferences
router.put('/preferences', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      next(new UnauthorizedError('User not found'));
      return;
    }
    
    const { theme, notifications, public_profile, default_project_visibility } = req.body;
    const now = new Date().toISOString();
    
    // Update user preferences
    const updatePreferencesStmt = database.prepare(`
      UPDATE user_preferences SET 
        theme = COALESCE(?, theme),
        notifications = COALESCE(?, notifications),
        public_profile = COALESCE(?, public_profile),
        default_project_visibility = COALESCE(?, default_project_visibility),
        updated_at = ?
      WHERE user_id = ?
    `);
    
    updatePreferencesStmt.run(
      theme, 
      notifications, 
      public_profile, 
      default_project_visibility, 
      now, 
      req.user.id
    );
    
    // Get updated preferences
    const preferencesStmt = database.prepare('SELECT * FROM user_preferences WHERE user_id = ?');
    const updatedPreferences = preferencesStmt.get(req.user.id);
    
    // Log activity
    logUserActivity(req.user.id, 'update', 'user', req.user.id, {
      action: 'preferences_updated',
      fields_updated: Object.keys(req.body)
    });
    
    const response: ApiResponse = {
      success: true,
      data: updatedPreferences,
      message: 'Preferences updated successfully',
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/auth/sessions - Revoke all user sessions
router.delete('/sessions', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      next(new UnauthorizedError('User not found'));
      return;
    }
    
    await revokeAllUserSessions(req.user.id);
    
    // Log activity
    logUserActivity(req.user.id, 'update', 'user', req.user.id, {
      action: 'all_sessions_revoked'
    });
    
    const response: ApiResponse = {
      success: true,
      message: 'All sessions revoked successfully',
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router; 