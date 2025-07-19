import { database } from '../database/index';

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_PATH = ':memory:'; // Use in-memory database for tests
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
});

afterAll(async () => {
  // Clean up after all tests
  try {
    await database.close();
  } catch (error) {
    // Database might already be closed
  }
});

// Suppress console.log during tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  createTestUser: async () => {
    const userData = {
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
      terms_accepted: true
    };
    return userData;
  },
  
  generateRandomEmail: () => {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
  },
  
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

// Extend global namespace for TypeScript
declare global {
  var testUtils: {
    createTestUser: () => Promise<any>;
    generateRandomEmail: () => string;
    sleep: (ms: number) => Promise<void>;
  };
}