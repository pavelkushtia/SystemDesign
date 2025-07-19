import request from 'supertest';
import app from '../index';
import { database } from '../database/index';

describe('Authentication API', () => {
  beforeAll(async () => {
    // Initialize test database
    await database.initialize();
  });

  afterAll(async () => {
    // Clean up test database
    await database.close();
  });

  beforeEach(async () => {
    // Clean up users table before each test
    const deleteStmt = database.prepare('DELETE FROM users');
    deleteStmt.run();
    
    const deleteSessionsStmt = database.prepare('DELETE FROM user_sessions');
    deleteSessionsStmt.run();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        terms_accepted: true
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.first_name).toBe(userData.first_name);
      expect(response.body.user.last_name).toBe(userData.last_name);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
      expect(response.body.user.password_hash).toBeUndefined();
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        terms_accepted: true
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        first_name: 'Test',
        last_name: 'User',
        terms_accepted: true
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        terms_accepted: true
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        terms_accepted: true
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
      expect(response.body.user.password_hash).toBeUndefined();
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid email or password');
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid email or password');
    });

    it('should handle remember me option', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        remember_me: true
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create and login a test user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        terms_accepted: true
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.first_name).toBe('Test');
      expect(response.body.data.last_name).toBe('User');
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.password_hash).toBeUndefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Create and login a test user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        terms_accepted: true
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      refreshToken = loginResponse.body.refresh_token;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
      expect(response.body.access_token).not.toBe(refreshToken);
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });

    it('should reject refresh without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      // Create and login a test user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        terms_accepted: true
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      accessToken = loginResponse.body.access_token;
      refreshToken = loginResponse.body.refresh_token;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should logout without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject logout without access token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Make multiple failed login attempts
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send(loginData)
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Password Security', () => {
    it('should hash passwords properly', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        terms_accepted: true
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Check that password is hashed in database
      const userStmt = database.prepare('SELECT password_hash FROM users WHERE email = ?');
      const user = userStmt.get(userData.email) as any;
      
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe(userData.password);
      expect(user.password_hash.length).toBeGreaterThan(50); // bcrypt hash length
    });
  });
});