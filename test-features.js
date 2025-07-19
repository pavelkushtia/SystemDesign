#!/usr/bin/env node

/**
 * ScaleSim Feature Test Script
 * Tests all the newly implemented features
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';
let authToken = '';

// Test utilities
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m'
  };
  console.log(`${colors[type]}[${type.toUpperCase()}]\x1b[0m ${message}`);
};

const makeRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, error: error.message };
  }
};

// Test functions
const testHealthCheck = async () => {
  log('Testing health check endpoint...');
  const result = await makeRequest('/health');
  
  if (result.status === 200) {
    log('✅ Health check passed', 'success');
    return true;
  } else {
    log('❌ Health check failed', 'error');
    return false;
  }
};

const testAuthentication = async () => {
  log('Testing authentication...');
  
  // Register a test user
  const registerResult = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User'
    })
  });

  if (registerResult.status === 201) {
    authToken = registerResult.data.data.token;
    log('✅ User registration successful', 'success');
    return true;
  } else {
    log('❌ User registration failed', 'error');
    return false;
  }
};

const testSystemDesign = async () => {
  log('Testing system design features...');
  
  // Create a system
  const createResult = await makeRequest('/api/systems', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test System',
      description: 'A test system',
      components: [
        {
          id: 'comp1',
          type: 'microservice',
          name: 'User Service',
          config: { port: 3000 }
        }
      ],
      connections: []
    })
  });

  if (createResult.status === 201) {
    log('✅ System creation successful', 'success');
    return createResult.data.data.id;
  } else {
    log('❌ System creation failed', 'error');
    return null;
  }
};

const testAIFeatures = async () => {
  log('Testing AI features...');
  
  // Check AI status
  const statusResult = await makeRequest('/api/ai/status');
  
  if (statusResult.status === 200) {
    log('✅ AI status check successful', 'success');
    
    // Test AI chat
    const chatResult = await makeRequest('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello, can you help me?',
        action: 'general'
      })
    });
    
    if (chatResult.status === 200) {
      log('✅ AI chat successful', 'success');
      return true;
    } else {
      log('❌ AI chat failed', 'error');
      return false;
    }
  } else {
    log('❌ AI status check failed', 'error');
    return false;
  }
};

const testMonitoring = async (systemId) => {
  log('Testing monitoring features...');
  
  // Record a metric
  const metricResult = await makeRequest('/api/monitoring/metrics', {
    method: 'POST',
    body: JSON.stringify({
      systemId: systemId,
      componentId: 'comp1',
      metricType: 'cpu',
      value: 45.5,
      unit: 'percent'
    })
  });

  if (metricResult.status === 200) {
    log('✅ Metric recording successful', 'success');
    
    // Get system health
    const healthResult = await makeRequest(`/api/monitoring/health/${systemId}`);
    
    if (healthResult.status === 200) {
      log('✅ System health check successful', 'success');
      return true;
    } else {
      log('❌ System health check failed', 'error');
      return false;
    }
  } else {
    log('❌ Metric recording failed', 'error');
    return false;
  }
};

const testPatterns = async () => {
  log('Testing pattern library...');
  
  const patternsResult = await makeRequest('/api/patterns');
  
  if (patternsResult.status === 200) {
    log('✅ Pattern library access successful', 'success');
    return true;
  } else {
    log('❌ Pattern library access failed', 'error');
    return false;
  }
};

const testComponents = async () => {
  log('Testing component library...');
  
  const componentsResult = await makeRequest('/api/components');
  
  if (componentsResult.status === 200) {
    log('✅ Component library access successful', 'success');
    return true;
  } else {
    log('❌ Component library access failed', 'error');
    return false;
  }
};

const testSimulation = async (systemId) => {
  log('Testing simulation features...');
  
  const simulationResult = await makeRequest('/api/simulation/run', {
    method: 'POST',
    body: JSON.stringify({
      systemId: systemId,
      duration: 60,
      users: 100,
      requestsPerSecond: 10
    })
  });

  if (simulationResult.status === 200) {
    log('✅ Simulation successful', 'success');
    return true;
  } else {
    log('❌ Simulation failed', 'error');
    return false;
  }
};

const testDeployment = async (systemId) => {
  log('Testing deployment features...');
  
  const deploymentResult = await makeRequest('/api/deployment/generate', {
    method: 'POST',
    body: JSON.stringify({
      systemId: systemId,
      target: 'kubernetes',
      environment: 'development'
    })
  });

  if (deploymentResult.status === 200) {
    log('✅ Deployment manifest generation successful', 'success');
    return true;
  } else {
    log('❌ Deployment manifest generation failed', 'error');
    return false;
  }
};

// Main test runner
const runTests = async () => {
  log('🚀 Starting ScaleSim Feature Tests', 'info');
  log('=====================================', 'info');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'System Design', fn: testSystemDesign },
    { name: 'AI Features', fn: testAIFeatures },
    { name: 'Pattern Library', fn: testPatterns },
    { name: 'Component Library', fn: testComponents }
  ];

  let systemId = null;

  for (const test of tests) {
    results.total++;
    try {
      const result = await test.fn();
      if (test.name === 'System Design' && result) {
        systemId = result;
      }
      
      if (result) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      log(`❌ ${test.name} failed with error: ${error.message}`, 'error');
      results.failed++;
    }
  }

  // Run tests that require systemId
  if (systemId) {
    const systemTests = [
      { name: 'Monitoring', fn: () => testMonitoring(systemId) },
      { name: 'Simulation', fn: () => testSimulation(systemId) },
      { name: 'Deployment', fn: () => testDeployment(systemId) }
    ];

    for (const test of systemTests) {
      results.total++;
      try {
        const result = await test.fn();
        if (result) {
          results.passed++;
        } else {
          results.failed++;
        }
      } catch (error) {
        log(`❌ ${test.name} failed with error: ${error.message}`, 'error');
        results.failed++;
      }
    }
  }

  // Print summary
  log('=====================================', 'info');
  log('📊 Test Summary:', 'info');
  log(`Total Tests: ${results.total}`, 'info');
  log(`Passed: ${results.passed}`, 'success');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'info');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 
      results.failed === 0 ? 'success' : 'warning');

  if (results.failed === 0) {
    log('🎉 All tests passed! ScaleSim is ready to go!', 'success');
  } else {
    log('⚠️  Some tests failed. Check the logs above for details.', 'warning');
  }

  process.exit(results.failed === 0 ? 0 : 1);
};

// Check if server is running
const checkServer = async () => {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
};

// Start tests
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log('❌ Server is not running. Please start the backend server first:', 'error');
    log('   cd backend && npm run dev', 'info');
    process.exit(1);
  }

  await runTests();
})();