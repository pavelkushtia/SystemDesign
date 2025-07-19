# ScaleSim API Documentation

## Overview

ScaleSim provides a comprehensive REST API for managing distributed system designs, simulations, and deployments. The API follows RESTful conventions and returns JSON responses.

## Base URL

```
Production: https://api.scalesim.app
Development: http://localhost:3001/api
```

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt-token"
  }
}
```

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /auth/logout
Logout and invalidate the current session.

## Systems API

### GET /systems
Get all systems for the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "systems": [
      {
        "id": "system-id",
        "name": "My System",
        "description": "System description",
        "components": [],
        "connections": [],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### POST /systems
Create a new system.

**Request Body:**
```json
{
  "name": "My New System",
  "description": "System description",
  "components": [],
  "connections": []
}
```

### GET /systems/:id
Get a specific system by ID.

### PUT /systems/:id
Update a system.

### DELETE /systems/:id
Delete a system.

## Components API

### GET /components/templates
Get available component templates.

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "api-gateway",
        "name": "API Gateway",
        "category": "networking",
        "description": "Entry point for API requests",
        "ports": [
          {
            "name": "http",
            "type": "input",
            "protocol": "HTTP"
          }
        ],
        "config": {
          "rateLimiting": true,
          "authentication": true
        }
      }
    ]
  }
}
```

## Simulation API

### POST /simulation/run
Run a simulation for a system.

**Request Body:**
```json
{
  "systemId": "system-id",
  "config": {
    "duration": 300,
    "load": {
      "rps": 1000,
      "pattern": "constant"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "simulationId": "simulation-id",
    "status": "running",
    "startTime": "2024-01-01T00:00:00Z"
  }
}
```

### GET /simulation/:id/status
Get simulation status and results.

### POST /simulation/:id/stop
Stop a running simulation.

## Deployment API

### POST /deployment/deploy
Deploy a system to a cloud provider.

**Request Body:**
```json
{
  "systemId": "system-id",
  "provider": "aws",
  "region": "us-east-1",
  "config": {
    "environment": "production",
    "scaling": {
      "minInstances": 2,
      "maxInstances": 10
    }
  }
}
```

### GET /deployment/:id/status
Get deployment status.

### POST /deployment/:id/rollback
Rollback a deployment.

## AI Assistant API

### POST /ai/generate-code
Generate code for a component.

**Request Body:**
```json
{
  "prompt": "Create a REST API endpoint for user management",
  "language": "javascript",
  "framework": "express",
  "context": {
    "componentType": "api-server",
    "connections": ["database", "cache"]
  }
}
```

### POST /ai/optimize-code
Get code optimization suggestions.

### POST /ai/suggest-architecture
Get architecture recommendations.

## WebSocket API

### Connection
Connect to WebSocket for real-time collaboration:

```
ws://localhost:3001
```

### Message Types

#### Join Room
```json
{
  "type": "user_join",
  "systemId": "system-id",
  "userId": "user-id",
  "userName": "John Doe"
}
```

#### System Update
```json
{
  "type": "system_update",
  "systemId": "system-id",
  "userId": "user-id",
  "data": {
    "components": [],
    "connections": []
  }
}
```

#### Cursor Movement
```json
{
  "type": "cursor_move",
  "systemId": "system-id",
  "userId": "user-id",
  "data": {
    "cursor": { "x": 100, "y": 200 }
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API requests are rate limited:
- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated users

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @scalesim/sdk
```

```javascript
import { ScaleSimClient } from '@scalesim/sdk';

const client = new ScaleSimClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.scalesim.app'
});

const systems = await client.systems.list();
```

### Python
```bash
pip install scalesim-python
```

```python
from scalesim import ScaleSimClient

client = ScaleSimClient(api_key='your-api-key')
systems = client.systems.list()
```

## Examples

### Creating a Microservices System

```javascript
// Create a new system
const system = await client.systems.create({
  name: 'E-commerce Platform',
  description: 'Microservices-based e-commerce system'
});

// Add components
const apiGateway = await client.systems.addComponent(system.id, {
  type: 'api-gateway',
  name: 'API Gateway',
  position: { x: 100, y: 100 }
});

const userService = await client.systems.addComponent(system.id, {
  type: 'microservice',
  name: 'User Service',
  position: { x: 300, y: 100 }
});

// Connect components
await client.systems.addConnection(system.id, {
  from: apiGateway.id,
  to: userService.id,
  protocol: 'HTTP'
});
```

### Running a Load Test

```javascript
// Start simulation
const simulation = await client.simulation.run({
  systemId: system.id,
  config: {
    duration: 300, // 5 minutes
    load: {
      rps: 1000,
      pattern: 'ramp-up'
    }
  }
});

// Monitor progress
const status = await client.simulation.getStatus(simulation.id);
console.log(`Simulation status: ${status.status}`);
```

## Support

- Documentation: https://docs.scalesim.app
- API Status: https://status.scalesim.app
- Support: support@scalesim.app
- GitHub: https://github.com/scalesim/scalesim