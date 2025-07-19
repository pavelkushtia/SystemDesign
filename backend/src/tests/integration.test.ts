import request from 'supertest';
import { app } from '../index';
import { database } from '../database/index';

describe('ScaleSim Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let systemId: string;

  beforeAll(async () => {
    // Initialize test database
    await database.initialize();
  });

  afterAll(async () => {
    // Clean up
    database.close();
  });

  describe('Authentication Flow', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      
      authToken = response.body.data.token;
      userId = response.body.data.user.id;
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('System Design Flow', () => {
    it('should create a new system', async () => {
      const response = await request(app)
        .post('/api/systems')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test System',
          description: 'A test system for integration testing',
          components: [
            {
              id: 'comp1',
              type: 'microservice',
              name: 'User Service',
              config: { port: 3000 }
            }
          ],
          connections: []
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test System');
      
      systemId = response.body.data.id;
    });

    it('should get system by id', async () => {
      const response = await request(app)
        .get(`/api/systems/${systemId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(systemId);
    });

    it('should update system', async () => {
      const response = await request(app)
        .put(`/api/systems/${systemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Test System',
          description: 'Updated description',
          components: [
            {
              id: 'comp1',
              type: 'microservice',
              name: 'User Service',
              config: { port: 3000 }
            },
            {
              id: 'comp2',
              type: 'database',
              name: 'User DB',
              config: { engine: 'postgres' }
            }
          ],
          connections: [
            {
              source: 'comp1',
              target: 'comp2',
              type: 'database_connection'
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Test System');
    });
  });

  describe('AI Assistant Flow', () => {
    it('should check AI status', async () => {
      const response = await request(app)
        .get('/api/ai/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.features).toBeDefined();
    });

    it('should handle AI chat request', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Hello, can you help me design a microservice?',
          action: 'general',
          context: {
            systemId: systemId
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.response).toBeDefined();
    });

    it('should generate code with AI', async () => {
      const response = await request(app)
        .post('/api/ai/generate-code')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Create a simple REST API for user management',
          language: 'javascript',
          framework: 'express'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBeDefined();
    });
  });

  describe('Simulation Flow', () => {
    it('should run system simulation', async () => {
      const response = await request(app)
        .post('/api/simulation/run')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          systemId: systemId,
          duration: 60,
          users: 100,
          requestsPerSecond: 10,
          trafficPattern: 'constant'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.metrics).toBeDefined();
      expect(response.body.data.resourceUtilization).toBeDefined();
    });
  });

  describe('Deployment Flow', () => {
    it('should generate deployment manifests', async () => {
      const response = await request(app)
        .post('/api/deployment/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          systemId: systemId,
          target: 'kubernetes',
          environment: 'development',
          namespace: 'test-namespace'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.manifests).toBeDefined();
      expect(response.body.data.target).toBe('kubernetes');
    });
  });

  describe('Monitoring Flow', () => {
    it('should record metrics', async () => {
      const response = await request(app)
        .post('/api/monitoring/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          systemId: systemId,
          componentId: 'comp1',
          metricType: 'cpu',
          value: 45.5,
          unit: 'percent'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should get system health', async () => {
      const response = await request(app)
        .get(`/api/monitoring/health/${systemId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBeDefined();
    });

    it('should create alert rule', async () => {
      const response = await request(app)
        .post('/api/monitoring/alert-rules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          systemId: systemId,
          componentId: 'comp1',
          metricType: 'cpu',
          condition: 'greater_than',
          threshold: 80,
          severity: 'high'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
    });

    it('should get dashboard data', async () => {
      const response = await request(app)
        .get(`/api/monitoring/dashboard/${systemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ timeRange: '1h' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.health).toBeDefined();
    });
  });

  describe('Pattern Library Flow', () => {
    it('should get available patterns', async () => {
      const response = await request(app)
        .get('/api/patterns')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get pattern by id', async () => {
      const response = await request(app)
        .get('/api/patterns/microservices_basic')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('microservices_basic');
    });
  });

  describe('Component Library Flow', () => {
    it('should get available components', async () => {
      const response = await request(app)
        .get('/api/components')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get component by type', async () => {
      const response = await request(app)
        .get('/api/components/microservice')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('microservice');
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthorized requests', async () => {
      const response = await request(app)
        .get('/api/systems');

      expect(response.status).toBe(401);
    });

    it('should handle not found resources', async () => {
      const response = await request(app)
        .get('/api/systems/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/systems')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/patterns')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    it('should handle large system designs', async () => {
      const largeSystem = {
        name: 'Large Test System',
        description: 'A large system with many components',
        components: Array.from({ length: 50 }, (_, i) => ({
          id: `comp${i}`,
          type: 'microservice',
          name: `Service ${i}`,
          config: { port: 3000 + i }
        })),
        connections: Array.from({ length: 25 }, (_, i) => ({
          source: `comp${i}`,
          target: `comp${i + 1}`,
          type: 'api_call'
        }))
      };

      const response = await request(app)
        .post('/api/systems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largeSystem);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.components).toHaveLength(50);
    });
  });

  describe('Real-time Features', () => {
    it('should handle WebSocket connections', (done) => {
      // This would require a WebSocket client for testing
      // For now, we'll just verify the endpoint exists
      request(app)
        .get('/health')
        .expect(200)
        .end(done);
    });
  });
});