import { ServiceBuilderConfig } from '@scalesim/shared';

export interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requestSchema?: any;
  responseSchema?: any;
  authentication?: boolean;
  rateLimit?: number;
  middleware?: string[];
}

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'sqlite';
  host?: string;
  port?: number;
  database?: string;
  schema?: any;
}

export interface ServiceConfig extends ServiceBuilderConfig {
  endpoints: Endpoint[];
  database?: DatabaseConfig;
  authentication?: {
    type: 'jwt' | 'oauth' | 'basic' | 'none';
    providers?: string[];
  };
  middleware?: string[];
  environment?: Record<string, string>;
  dependencies?: string[];
}

export class ServiceBuilder {
  generateCode(config: ServiceConfig): Record<string, string> {
    const files: Record<string, string> = {};
    
    switch (config.framework) {
      case 'express':
        return this.generateExpressService(config);
      case 'fastapi':
        return this.generateFastAPIService(config);
      case 'spring-boot':
        return this.generateSpringBootService(config);
      case 'django':
        return this.generateDjangoService(config);
      case 'flask':
        return this.generateFlaskService(config);
      case 'gin':
        return this.generateGinService(config);
      default:
        return this.generateExpressService(config);
    }
  }

  private generateExpressService(config: ServiceConfig): Record<string, string> {
    const files: Record<string, string> = {};

    // Package.json
    files['package.json'] = JSON.stringify({
      name: config.name,
      version: '1.0.0',
      description: `Generated Express.js service for ${config.name}`,
      main: 'src/app.js',
      scripts: {
        start: 'node src/app.js',
        dev: 'nodemon src/app.js',
        test: 'jest'
      },
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        helmet: '^7.0.0',
        'express-rate-limit': '^6.8.1',
        dotenv: '^16.3.1',
        ...(config.database?.type === 'postgresql' && { pg: '^8.11.1', 'pg-hstore': '^2.3.4' }),
        ...(config.database?.type === 'mongodb' && { mongoose: '^7.4.0' }),
        ...(config.database?.type === 'redis' && { redis: '^4.6.7' }),
        ...(config.authentication?.type === 'jwt' && { jsonwebtoken: '^9.0.1', bcryptjs: '^2.4.3' }),
        ...(config.authentication?.type === 'oauth' && { passport: '^0.6.0' })
      },
      devDependencies: {
        nodemon: '^3.0.1',
        jest: '^29.6.1',
        supertest: '^6.3.3'
      }
    }, null, 2);

    // Main application file
    files['src/app.js'] = this.generateExpressApp(config);

    // Routes
    files['src/routes/index.js'] = this.generateExpressRoutes(config);

    // Database configuration
    if (config.database) {
      files['src/config/database.js'] = this.generateExpressDatabaseConfig(config.database);
    }

    // Authentication middleware
    if (config.authentication && config.authentication.type !== 'none') {
      files['src/middleware/auth.js'] = this.generateExpressAuthMiddleware(config.authentication);
    }

    // Environment configuration
    files['.env.example'] = this.generateEnvFile(config);

    // Docker configuration
    files['Dockerfile'] = this.generateDockerfile('node:18-alpine', 'src/app.js');
    files['docker-compose.yml'] = this.generateDockerCompose(config);

    // Tests
    files['tests/app.test.js'] = this.generateExpressTests(config);

    // README
    files['README.md'] = this.generateReadme(config);

    return files;
  }

  private generateExpressApp(config: ServiceConfig): string {
    return `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const routes = require('./routes');
${config.database ? "const database = require('./config/database');" : ''}
${config.authentication && config.authentication.type !== 'none' ? "const auth = require('./middleware/auth');" : ''}

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

${config.database ? '// Initialize database connection\ndatabase.connect();' : ''}

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: '${config.name}'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(\`🚀 ${config.name} server running on port \${PORT}\`);
});

module.exports = app;`;
  }

  private generateExpressRoutes(config: ServiceConfig): string {
    const routes = config.endpoints.map(endpoint => {
      const method = endpoint.method.toLowerCase();
      const authMiddleware = endpoint.authentication ? 'auth.authenticate, ' : '';
      
      return `// ${endpoint.description}
router.${method}('${endpoint.path}', ${authMiddleware}async (req, res) => {
  try {
    // TODO: Implement ${endpoint.description}
    ${this.generateEndpointLogic(endpoint)}
    
    res.json({
      success: true,
      message: '${endpoint.description} executed successfully'
    });
  } catch (error) {
    console.error('Error in ${endpoint.path}:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});`;
    }).join('\n\n');

    return `const express = require('express');
const router = express.Router();
${config.authentication && config.authentication.type !== 'none' ? "const auth = require('../middleware/auth');" : ''}

${routes}

module.exports = router;`;
  }

  private generateFastAPIService(config: ServiceConfig): Record<string, string> {
    const files: Record<string, string> = {};

    // Requirements.txt
    const requirements = [
      'fastapi==0.103.0',
      'uvicorn[standard]==0.23.2',
      'pydantic==2.1.1',
      'python-multipart==0.0.6'
    ];

    if (config.database?.type === 'postgresql') {
      requirements.push('asyncpg==0.28.0', 'databases[postgresql]==0.7.0');
    }
    if (config.database?.type === 'mongodb') {
      requirements.push('motor==3.2.0');
    }
    if (config.authentication?.type === 'jwt') {
      requirements.push('python-jose[cryptography]==3.3.0', 'passlib[bcrypt]==1.7.4');
    }

    files['requirements.txt'] = requirements.join('\n');

    // Main application
    files['main.py'] = this.generateFastAPIApp(config);

    // Models
    files['models.py'] = this.generateFastAPIModels(config);

    // Routes
    files['routers/__init__.py'] = '';
    config.endpoints.forEach(endpoint => {
      const routerName = endpoint.path.split('/')[1] || 'main';
      if (!files[`routers/${routerName}.py`]) {
        files[`routers/${routerName}.py`] = this.generateFastAPIRouter(config, routerName);
      }
    });

    // Database configuration
    if (config.database) {
      files['database.py'] = this.generateFastAPIDatabase(config.database);
    }

    // Authentication
    if (config.authentication && config.authentication.type !== 'none') {
      files['auth.py'] = this.generateFastAPIAuth(config.authentication);
    }

    // Docker and deployment
    files['Dockerfile'] = this.generateDockerfile('python:3.11-slim', 'main.py');
    files['docker-compose.yml'] = this.generateDockerCompose(config);

    // Tests
    files['test_main.py'] = this.generateFastAPITests(config);

    return files;
  }

  private generateFastAPIApp(config: ServiceConfig): string {
    return `from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn

${config.database ? 'from database import database' : ''}
${config.authentication && config.authentication.type !== 'none' ? 'from auth import get_current_user' : ''}

app = FastAPI(
    title="${config.name}",
    description="Generated FastAPI service for ${config.name}",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

${config.database ? `
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
` : ''}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "${config.name}",
        "timestamp": "2023-01-01T00:00:00Z"
    }

${config.endpoints.map(endpoint => this.generateFastAPIEndpoint(endpoint)).join('\n\n')}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)`;
  }

  private generateSpringBootService(config: ServiceConfig): Record<string, string> {
    const files: Record<string, string> = {};

    // pom.xml
    files['pom.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.2</version>
        <relativePath/>
    </parent>
    
    <groupId>com.scalesim</groupId>
    <artifactId>${config.name.toLowerCase().replace(/\s+/g, '-')}</artifactId>
    <version>1.0.0</version>
    <name>${config.name}</name>
    <description>Generated Spring Boot service for ${config.name}</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        ${config.database?.type === 'postgresql' ? `
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>` : ''}
        ${config.authentication?.type === 'jwt' ? `
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>` : ''}
    </dependencies>
</project>`;

    // Main application class
    const packageName = `com.scalesim.${config.name.toLowerCase().replace(/\s+/g, '')}`;
    const className = config.name.replace(/\s+/g, '') + 'Application';
    
    files[`src/main/java/${packageName.replace(/\./g, '/')}/Application.java`] = 
      this.generateSpringBootMainClass(packageName, className);

    // Controller
    files[`src/main/java/${packageName.replace(/\./g, '/')}/controller/ApiController.java`] = 
      this.generateSpringBootController(packageName, config);

    // Application properties
    files['src/main/resources/application.yml'] = this.generateSpringBootProperties(config);

    return files;
  }

  // Helper methods for generating specific parts
  private generateEndpointLogic(endpoint: Endpoint): string {
    switch (endpoint.method) {
      case 'GET':
        return `// Fetch data logic here
    const data = {}; // Replace with actual data fetching`;
      case 'POST':
        return `// Create new resource logic here
    const { body } = req;
    // Validate and save data`;
      case 'PUT':
        return `// Update resource logic here
    const { id } = req.params;
    const { body } = req;
    // Update logic`;
      case 'DELETE':
        return `// Delete resource logic here
    const { id } = req.params;
    // Delete logic`;
      default:
        return '// Implement endpoint logic here';
    }
  }

  private generateFastAPIEndpoint(endpoint: Endpoint): string {
    const method = endpoint.method.toLowerCase();
    const authParam = endpoint.authentication ? ', current_user: dict = Depends(get_current_user)' : '';
    
    return `@app.${method}("${endpoint.path}")
async def ${endpoint.path.replace(/[\/\-]/g, '_').replace(/^_/, '')}${endpoint.method.toLowerCase()}(${authParam}):
    """${endpoint.description}"""
    # TODO: Implement ${endpoint.description}
    return {"message": "${endpoint.description} executed successfully"}`;
  }

  private generateExpressDatabaseConfig(database: DatabaseConfig): string {
    switch (database.type) {
      case 'postgresql':
        return `const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || '${database.database || 'app_db'}',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

module.exports = {
  connect: async () => {
    try {
      await pool.connect();
      console.log('✅ PostgreSQL connected successfully');
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error);
    }
  },
  query: (text, params) => pool.query(text, params),
  pool
};`;
      case 'mongodb':
        return `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/${database.database || 'app_db'}');
    console.log(\`✅ MongoDB connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = { connect: connectDB };`;
      default:
        return '// Database configuration placeholder';
    }
  }

  private generateExpressAuthMiddleware(auth: any): string {
    if (auth.type === 'jwt') {
      return `const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = { authenticate };`;
    }
    return '// Authentication middleware placeholder';
  }

  private generateEnvFile(config: ServiceConfig): string {
    const envVars = [
      'NODE_ENV=development',
      'PORT=3000',
      ...(config.database?.type === 'postgresql' ? [
        'DB_HOST=localhost',
        'DB_PORT=5432',
        'DB_NAME=app_db',
        'DB_USER=postgres',
        'DB_PASSWORD=password'
      ] : []),
      ...(config.database?.type === 'mongodb' ? [
        'MONGODB_URI=mongodb://localhost:27017/app_db'
      ] : []),
      ...(config.authentication?.type === 'jwt' ? [
        'JWT_SECRET=your-super-secret-jwt-key-change-in-production'
      ] : [])
    ];
    
    return envVars.join('\n');
  }

  private generateDockerfile(baseImage: string, entrypoint: string): string {
    return `FROM ${baseImage}

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "${entrypoint}"]`;
  }

  private generateDockerCompose(config: ServiceConfig): string {
    const services: any = {
      app: {
        build: '.',
        ports: ['3000:3000'],
        environment: ['NODE_ENV=development'],
        depends_on: []
      }
    };

    if (config.database?.type === 'postgresql') {
      services.postgres = {
        image: 'postgres:15',
        environment: [
          'POSTGRES_DB=app_db',
          'POSTGRES_USER=postgres',
          'POSTGRES_PASSWORD=password'
        ],
        ports: ['5432:5432'],
        volumes: ['postgres_data:/var/lib/postgresql/data']
      };
      services.app.depends_on.push('postgres');
    }

    if (config.database?.type === 'mongodb') {
      services.mongodb = {
        image: 'mongo:6',
        ports: ['27017:27017'],
        volumes: ['mongodb_data:/data/db']
      };
      services.app.depends_on.push('mongodb');
    }

    const compose = {
      version: '3.8',
      services,
      volumes: {}
    };

    if (config.database?.type === 'postgresql') {
      compose.volumes = { postgres_data: {} };
    }
    if (config.database?.type === 'mongodb') {
      compose.volumes = { mongodb_data: {} };
    }

    return `# Generated docker-compose.yml for ${config.name}
${JSON.stringify(compose, null, 2).replace(/"/g, '')}`;
  }

  private generateExpressTests(config: ServiceConfig): string {
    return `const request = require('supertest');
const app = require('../src/app');

describe('${config.name} API', () => {
  test('Health check endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
    expect(response.body.service).toBe('${config.name}');
  });

${config.endpoints.map(endpoint => `
  test('${endpoint.method} ${endpoint.path}', async () => {
    const response = await request(app)
      .${endpoint.method.toLowerCase()}('${endpoint.path}')
      ${endpoint.method === 'POST' || endpoint.method === 'PUT' ? '.send({})' : ''}
      .expect(${endpoint.authentication ? '401' : '200'});
    
    ${endpoint.authentication ? 
      "expect(response.body.error).toBeDefined();" : 
      "expect(response.body.success).toBe(true);"}
  });`).join('')}
});`;
  }

  private generateReadme(config: ServiceConfig): string {
    return `# ${config.name}

Generated ${config.framework} service using ScaleSim Service Builder.

## Features

- **Framework**: ${config.framework}
- **Endpoints**: ${config.endpoints.length} API endpoints
${config.database ? `- **Database**: ${config.database.type}` : ''}
${config.authentication ? `- **Authentication**: ${config.authentication.type}` : ''}

## API Endpoints

${config.endpoints.map(endpoint => 
  `- **${endpoint.method}** \`${endpoint.path}\` - ${endpoint.description}`
).join('\n')}

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Docker Deployment

\`\`\`bash
docker-compose up -d
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

---

Generated by ScaleSim Service Builder
`;
  }

  // Additional helper methods for other frameworks...
  private generateFastAPIModels(config: ServiceConfig): string {
    return `from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BaseResponse(BaseModel):
    success: bool = True
    message: str
    timestamp: datetime = datetime.now()

# Add your custom models here
`;
  }

  private generateFastAPIRouter(config: ServiceConfig, routerName: string): string {
    return `from fastapi import APIRouter, HTTPException
from models import BaseResponse

router = APIRouter(prefix="/${routerName}", tags=["${routerName}"])

# Add your routes here
`;
  }

  private generateFastAPIDatabase(database: DatabaseConfig): string {
    if (database.type === 'postgresql') {
      return `import databases
import sqlalchemy

DATABASE_URL = "postgresql://user:password@localhost/dbname"

database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()
engine = sqlalchemy.create_engine(DATABASE_URL)
`;
    }
    return '# Database configuration';
  }

  private generateFastAPIAuth(auth: any): string {
    return `from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # TODO: Implement JWT token validation
    return {"user_id": "123", "username": "user"}
`;
  }

  private generateFastAPITests(config: ServiceConfig): string {
    return `from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
`;
  }

  private generateSpringBootMainClass(packageName: string, className: string): string {
    return `package ${packageName};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${className} {
    public static void main(String[] args) {
        SpringApplication.run(${className}.class, args);
    }
}`;
  }

  private generateSpringBootController(packageName: string, config: ServiceConfig): string {
    return `package ${packageName}.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "${config.name}");
        return ResponseEntity.ok(response);
    }

${config.endpoints.map(endpoint => `
    @${endpoint.method.charAt(0) + endpoint.method.slice(1).toLowerCase()}Mapping("${endpoint.path}")
    public ResponseEntity<Map<String, Object>> ${endpoint.path.replace(/[\/\-]/g, '').toLowerCase()}${endpoint.method.toLowerCase()}() {
        // TODO: Implement ${endpoint.description}
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "${endpoint.description} executed successfully");
        return ResponseEntity.ok(response);
    }`).join('')}
}`;
  }

  private generateSpringBootProperties(config: ServiceConfig): string {
    return `server:
  port: 8080

spring:
  application:
    name: ${config.name}
${config.database?.type === 'postgresql' ? `
  datasource:
    url: jdbc:postgresql://localhost:5432/app_db
    username: postgres
    password: password
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true` : ''}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
`;
  }
} 