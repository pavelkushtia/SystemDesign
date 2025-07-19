import request from 'supertest';
import app from '../index';
import { database } from '../database/index';

describe('AI Assistant API', () => {
  let accessToken: string;

  beforeAll(async () => {
    await database.initialize();
    
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

  afterAll(async () => {
    await database.close();
  });

  describe('GET /api/ai/status', () => {
    it('should return AI assistant status', async () => {
      const response = await request(app)
        .get('/api/ai/status')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('openai');
      expect(response.body.data).toHaveProperty('anthropic');
      expect(response.body.data).toHaveProperty('fallbackMode');
      expect(response.body.data).toHaveProperty('features');
      expect(response.body.data.features).toHaveProperty('codeGeneration');
      expect(response.body.data.features).toHaveProperty('codeOptimization');
      expect(response.body.data.features).toHaveProperty('architectureSuggestions');
      expect(response.body.data.features).toHaveProperty('documentationGeneration');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/ai/status')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai/generate-code', () => {
    it('should generate code successfully', async () => {
      const codeRequest = {
        prompt: 'Create a simple Express.js route handler',
        language: 'javascript',
        framework: 'express',
        context: {
          componentType: 'microservice',
          connections: ['database'],
          requirements: ['authentication', 'validation']
        }
      };

      const response = await request(app)
        .post('/api/ai/generate-code')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(codeRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('code');
      expect(response.body.data).toHaveProperty('explanation');
      expect(response.body.data).toHaveProperty('dependencies');
      expect(Array.isArray(response.body.data.dependencies)).toBe(true);
    });

    it('should reject requests without prompt', async () => {
      const codeRequest = {
        language: 'javascript'
      };

      const response = await request(app)
        .post('/api/ai/generate-code')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(codeRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should reject requests without language', async () => {
      const codeRequest = {
        prompt: 'Create a function'
      };

      const response = await request(app)
        .post('/api/ai/generate-code')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(codeRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should handle different programming languages', async () => {
      const languages = ['javascript', 'python', 'java', 'go'];
      
      for (const language of languages) {
        const codeRequest = {
          prompt: 'Create a hello world function',
          language
        };

        const response = await request(app)
          .post('/api/ai/generate-code')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(codeRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.code).toBeDefined();
      }
    });
  });

  describe('POST /api/ai/optimize-code', () => {
    it('should provide code optimization suggestions', async () => {
      const optimizationRequest = {
        code: `
function inefficientFunction() {
  var result = [];
  for (var i = 0; i < 1000; i++) {
    result.push(i * 2);
  }
  return result;
}
        `,
        language: 'javascript',
        framework: 'node',
        performanceGoals: ['memory', 'speed']
      };

      const response = await request(app)
        .post('/api/ai/optimize-code')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(optimizationRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('suggestions');
      expect(response.body.data).toHaveProperty('overallScore');
      expect(Array.isArray(response.body.data.suggestions)).toBe(true);
      expect(typeof response.body.data.overallScore).toBe('number');
    });

    it('should reject requests without code', async () => {
      const optimizationRequest = {
        language: 'javascript'
      };

      const response = await request(app)
        .post('/api/ai/optimize-code')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(optimizationRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should provide suggestions with proper structure', async () => {
      const optimizationRequest = {
        code: 'function test() { console.log("test"); }',
        language: 'javascript'
      };

      const response = await request(app)
        .post('/api/ai/optimize-code')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(optimizationRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      if (response.body.data.suggestions.length > 0) {
        const suggestion = response.body.data.suggestions[0];
        expect(suggestion).toHaveProperty('type');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('before');
        expect(suggestion).toHaveProperty('after');
        expect(suggestion).toHaveProperty('impact');
        expect(['performance', 'security', 'maintainability', 'best-practice']).toContain(suggestion.type);
        expect(['low', 'medium', 'high']).toContain(suggestion.impact);
      }
    });
  });

  describe('POST /api/ai/suggest-architecture', () => {
    it('should provide architecture suggestions', async () => {
      const architectureRequest = {
        requirements: 'Build a scalable e-commerce platform with user authentication, product catalog, and payment processing',
        scale: 'medium',
        constraints: ['budget-conscious', 'cloud-native'],
        preferences: {
          cloudProvider: 'aws',
          budget: 'moderate',
          timeline: '3-6 months'
        }
      };

      const response = await request(app)
        .post('/api/ai/suggest-architecture')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(architectureRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('architecture');
      expect(response.body.data).toHaveProperty('reasoning');
      expect(response.body.data).toHaveProperty('alternatives');
      expect(response.body.data.architecture).toHaveProperty('components');
      expect(response.body.data.architecture).toHaveProperty('patterns');
      expect(response.body.data.architecture).toHaveProperty('technologies');
      expect(Array.isArray(response.body.data.architecture.components)).toBe(true);
      expect(Array.isArray(response.body.data.architecture.patterns)).toBe(true);
      expect(Array.isArray(response.body.data.architecture.technologies)).toBe(true);
    });

    it('should reject requests without requirements', async () => {
      const architectureRequest = {
        scale: 'medium'
      };

      const response = await request(app)
        .post('/api/ai/suggest-architecture')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(architectureRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should handle different scale requirements', async () => {
      const scales = ['small', 'medium', 'large', 'enterprise'];
      
      for (const scale of scales) {
        const architectureRequest = {
          requirements: 'Build a web application',
          scale
        };

        const response = await request(app)
          .post('/api/ai/suggest-architecture')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(architectureRequest)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.architecture.components.length).toBeGreaterThan(0);
      }
    });
  });

  describe('POST /api/ai/generate-documentation', () => {
    it('should generate API documentation', async () => {
      const docRequest = {
        code: `
app.get('/api/users', (req, res) => {
  // Get all users
  res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
  // Create new user
  res.json({ user: req.body });
});
        `,
        type: 'api'
      };

      const response = await request(app)
        .post('/api/ai/generate-documentation')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(docRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('documentation');
      expect(response.body.data).toHaveProperty('format');
      expect(response.body.data.format).toBe('markdown');
      expect(response.body.data.documentation.length).toBeGreaterThan(0);
    });

    it('should generate architecture documentation', async () => {
      const docRequest = {
        code: `
components:
  - api_gateway
  - microservice
  - database
connections:
  - api_gateway -> microservice
  - microservice -> database
        `,
        type: 'architecture'
      };

      const response = await request(app)
        .post('/api/ai/generate-documentation')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(docRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documentation).toBeDefined();
      expect(response.body.data.format).toBe('markdown');
    });

    it('should reject invalid documentation types', async () => {
      const docRequest = {
        code: 'some code',
        type: 'invalid-type'
      };

      const response = await request(app)
        .post('/api/ai/generate-documentation')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(docRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('api, architecture, deployment');
    });
  });

  describe('POST /api/ai/analyze-system', () => {
    it('should analyze system design', async () => {
      const analysisRequest = {
        systemId: 'test-system-123',
        components: [
          { id: 'api-1', type: 'api_gateway', name: 'API Gateway' },
          { id: 'svc-1', type: 'microservice', name: 'User Service' },
          { id: 'db-1', type: 'database', name: 'PostgreSQL' }
        ],
        connections: [
          { id: 'conn-1', source: 'api-1', target: 'svc-1' },
          { id: 'conn-2', source: 'svc-1', target: 'db-1' }
        ]
      };

      const response = await request(app)
        .post('/api/ai/analyze-system')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(analysisRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('architecture');
      expect(response.body.data).toHaveProperty('systemAnalysis');
      expect(response.body.data.systemAnalysis).toHaveProperty('componentCount');
      expect(response.body.data.systemAnalysis).toHaveProperty('connectionCount');
      expect(response.body.data.systemAnalysis).toHaveProperty('complexity');
      expect(response.body.data.systemAnalysis).toHaveProperty('recommendations');
      expect(response.body.data.systemAnalysis.componentCount).toBe(3);
      expect(response.body.data.systemAnalysis.connectionCount).toBe(2);
    });

    it('should reject requests without system ID', async () => {
      const analysisRequest = {
        components: []
      };

      const response = await request(app)
        .post('/api/ai/analyze-system')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(analysisRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject all AI endpoints without authentication', async () => {
      const endpoints = [
        { method: 'get', path: '/api/ai/status' },
        { method: 'post', path: '/api/ai/generate-code', body: { prompt: 'test', language: 'js' } },
        { method: 'post', path: '/api/ai/optimize-code', body: { code: 'test', language: 'js' } },
        { method: 'post', path: '/api/ai/suggest-architecture', body: { requirements: 'test', scale: 'small' } },
        { method: 'post', path: '/api/ai/generate-documentation', body: { code: 'test', type: 'api' } },
        { method: 'post', path: '/api/ai/analyze-system', body: { systemId: 'test', components: [] } }
      ];

      for (const endpoint of endpoints) {
        const req = request(app)[endpoint.method as keyof typeof request](endpoint.path);
        
        if (endpoint.body) {
          req.send(endpoint.body);
        }

        const response = await req.expect(401);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/ai/generate-code')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle missing required fields gracefully', async () => {
      const response = await request(app)
        .post('/api/ai/generate-code')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on AI endpoints', async () => {
      const requests = Array(20).fill(null).map(() =>
        request(app)
          .post('/api/ai/generate-code')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ prompt: 'test', language: 'javascript' })
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});