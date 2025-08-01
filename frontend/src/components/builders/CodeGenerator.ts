export interface ServiceConfig {
  name: string;
  framework: string;
  database?: string;
  authentication?: string;
  endpoints: EndpointConfig[];
}

export interface EndpointConfig {
  method: string;
  path: string;
  description: string;
  requestBody?: string;
  responseType?: string;
}

export interface MLModelConfig {
  name: string;
  framework: string;
  taskType: string;
  architecture: LayerConfig[];
  hyperparameters: Record<string, any>;
}

export interface LayerConfig {
  type: string;
  config: Record<string, any>;
}

export class CodeGenerator {
  
  // Service Code Generation
  static generateServiceCode(config: ServiceConfig): { [filename: string]: string } {
    switch (config.framework) {
      case 'spring-boot':
        return this.generateSpringBootCode(config);
      case 'django':
        return this.generateDjangoCode(config);
      case 'express':
        return this.generateExpressCode(config);
      case 'fastapi':
        return this.generateFastAPICode(config);
      default:
        throw new Error(`Unsupported framework: ${config.framework}`);
    }
  }

  // Spring Boot Code Generation
  static generateSpringBootCode(config: ServiceConfig): { [filename: string]: string } {
    const controllerCode = `package com.scalesim.${config.name.toLowerCase()};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;

@SpringBootApplication
public class ${this.toPascalCase(config.name)}Application {
    public static void main(String[] args) {
        SpringApplication.run(${this.toPascalCase(config.name)}Application.class, args);
    }
}

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ${this.toPascalCase(config.name)}Controller {
    
${config.endpoints.map(endpoint => this.generateSpringBootEndpoint(endpoint)).join('\n\n')}
}`;

    const pomXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.0</version>
        <relativePath/>
    </parent>
    <groupId>com.scalesim</groupId>
    <artifactId>${config.name.toLowerCase()}</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>${config.name}</name>
    <description>Generated by ScaleSim</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        ${config.database === 'postgresql' ? `
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>` : ''}
        ${config.authentication === 'jwt' ? `
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>` : ''}
    </dependencies>
</project>`;

    const dockerFile = `FROM openjdk:17-jdk-slim

WORKDIR /app
COPY target/${config.name.toLowerCase()}-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]`;

    return {
      'src/main/java/com/scalesim/Application.java': controllerCode,
      'pom.xml': pomXml,
      'Dockerfile': dockerFile,
      'README.md': this.generateReadme(config)
    };
  }

  // Django Code Generation
  static generateDjangoCode(config: ServiceConfig): { [filename: string]: string } {
    const viewsCode = `from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

# Generated by ScaleSim

${config.endpoints.map(endpoint => this.generateDjangoEndpoint(endpoint)).join('\n\n')}`;

    const urlsCode = `from django.urls import path
from . import views

urlpatterns = [
${config.endpoints.map(endpoint => 
    `    path('${endpoint.path.replace(/^\//, '')}', views.${this.toSnakeCase(endpoint.path)}, name='${this.toSnakeCase(endpoint.path)}'),`
).join('\n')}
]`;

    const settingsCode = `import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'your-secret-key-here'
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    '${config.name.toLowerCase()}',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = '${config.name.toLowerCase()}.urls'

${config.database === 'postgresql' ? `
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': '${config.name.toLowerCase()}',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}` : `
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}`}`;

    const requirementsCode = `Django==4.2.0
djangorestframework==3.14.0
${config.database === 'postgresql' ? 'psycopg2-binary==2.9.5' : ''}
${config.authentication === 'jwt' ? 'djangorestframework-simplejwt==5.2.2' : ''}`;

    return {
      'views.py': viewsCode,
      'urls.py': urlsCode,
      'settings.py': settingsCode,
      'requirements.txt': requirementsCode,
      'Dockerfile': this.generateDjangoDockerfile(),
      'README.md': this.generateReadme(config)
    };
  }

  // Express.js Code Generation
  static generateExpressCode(config: ServiceConfig): { [filename: string]: string } {
    const serverCode = `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
${config.database === 'postgresql' ? "const { Pool } = require('pg');" : ''}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

${config.database === 'postgresql' ? `
// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/${config.name.toLowerCase()}'
});` : ''}

// Generated by ScaleSim
${config.endpoints.map(endpoint => this.generateExpressEndpoint(endpoint)).join('\n\n')}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(\`${config.name} server running on port \${PORT}\`);
});`;

    const packageJson = `{
  "name": "${config.name.toLowerCase()}",
  "version": "1.0.0",
  "description": "Generated by ScaleSim",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^6.1.5",
    "morgan": "^1.10.0"${config.database === 'postgresql' ? ',\n    "pg": "^8.11.0"' : ''}${config.authentication === 'jwt' ? ',\n    "jsonwebtoken": "^9.0.0"' : ''}
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}`;

    return {
      'server.js': serverCode,
      'package.json': packageJson,
      'Dockerfile': this.generateExpressDockerfile(),
      '.env.example': this.generateEnvExample(config),
      'README.md': this.generateReadme(config)
    };
  }

  // ML Model Code Generation
  static generateMLModelCode(config: MLModelConfig): { [filename: string]: string } {
    switch (config.framework) {
      case 'pytorch':
        return this.generatePyTorchCode(config);
      case 'tensorflow':
        return this.generateTensorFlowCode(config);
      case 'scikit-learn':
        return this.generateScikitLearnCode(config);
      default:
        throw new Error(`Unsupported ML framework: ${config.framework}`);
    }
  }

  // PyTorch Code Generation
  static generatePyTorchCode(config: MLModelConfig): { [filename: string]: string } {
    const modelCode = `import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import numpy as np

class ${this.toPascalCase(config.name)}Model(nn.Module):
    def __init__(self):
        super(${this.toPascalCase(config.name)}Model, self).__init__()
        
        # Generated architecture
        ${this.generatePyTorchLayers(config.architecture)}
        
    def forward(self, x):
        ${this.generatePyTorchForward(config.architecture)}
        return x

class ${this.toPascalCase(config.name)}Trainer:
    def __init__(self, model, device='cuda' if torch.cuda.is_available() else 'cpu'):
        self.model = model.to(device)
        self.device = device
        self.optimizer = optim.Adam(self.model.parameters(), lr=${config.hyperparameters.learning_rate || 0.001})
        self.criterion = nn.CrossEntropyLoss()  # Adjust based on task type
        
    def train(self, train_loader, num_epochs=${config.hyperparameters.epochs || 10}):
        self.model.train()
        for epoch in range(num_epochs):
            total_loss = 0
            for batch_idx, (data, target) in enumerate(train_loader):
                data, target = data.to(self.device), target.to(self.device)
                
                self.optimizer.zero_grad()
                output = self.model(data)
                loss = self.criterion(output, target)
                loss.backward()
                self.optimizer.step()
                
                total_loss += loss.item()
                
            print(f'Epoch {epoch+1}/{num_epochs}, Loss: {total_loss/len(train_loader):.4f}')
    
    def evaluate(self, test_loader):
        self.model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for data, target in test_loader:
                data, target = data.to(self.device), target.to(self.device)
                output = self.model(data)
                _, predicted = torch.max(output.data, 1)
                total += target.size(0)
                correct += (predicted == target).sum().item()
        
        accuracy = 100 * correct / total
        print(f'Accuracy: {accuracy:.2f}%')
        return accuracy

if __name__ == '__main__':
    model = ${this.toPascalCase(config.name)}Model()
    trainer = ${this.toPascalCase(config.name)}Trainer(model)
    print("Model created successfully!")
    print(f"Model has {sum(p.numel() for p in model.parameters())} parameters")`;

    const servingCode = `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import numpy as np
from typing import List
import uvicorn

app = FastAPI(title="${config.name} Model API", version="1.0.0")

# Load the trained model
model = torch.load('${config.name.toLowerCase()}_model.pth', map_location='cpu')
model.eval()

class PredictionRequest(BaseModel):
    data: List[float]

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        # Convert input to tensor
        input_tensor = torch.tensor([request.data], dtype=torch.float32)
        
        # Make prediction
        with torch.no_grad():
            output = model(input_tensor)
            prediction = output.item()
            confidence = torch.sigmoid(output).item()
        
        return PredictionResponse(prediction=prediction, confidence=confidence)
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)`;

    const requirementsCode = `torch>=2.0.0
fastapi>=0.100.0
uvicorn>=0.23.0
pydantic>=2.0.0
numpy>=1.24.0`;

    return {
      'model.py': modelCode,
      'serve.py': servingCode,
      'requirements.txt': requirementsCode,
      'Dockerfile': this.generatePyTorchDockerfile(),
      'README.md': this.generateMLReadme(config)
    };
  }

  // Helper methods for code generation
  static generateSpringBootEndpoint(endpoint: EndpointConfig): string {
    const method = endpoint.method.toLowerCase();
    const annotation = method === 'get' ? '@GetMapping' : 
                      method === 'post' ? '@PostMapping' : 
                      method === 'put' ? '@PutMapping' : 
                      method === 'delete' ? '@DeleteMapping' : '@RequestMapping';
    
    return `    ${annotation}("${endpoint.path}")
    public ResponseEntity<?> ${this.toCamelCase(endpoint.path)}(${method === 'post' || method === 'put' ? '@RequestBody Map<String, Object> requestBody' : ''}) {
        // ${endpoint.description}
        // TODO: Implement your business logic here
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Success");
        response.put("timestamp", new Date());
        return ResponseEntity.ok(response);
    }`;
  }

  static generateExpressEndpoint(endpoint: EndpointConfig): string {
    return `app.${endpoint.method.toLowerCase()}('${endpoint.path}', async (req, res) => {
  try {
    // ${endpoint.description}
    // TODO: Implement your business logic here
    
    res.json({
      message: 'Success',
      timestamp: new Date().toISOString(),
      data: ${endpoint.method.toLowerCase() === 'get' ? '[]' : 'req.body'}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`;
  }

  static generatePyTorchLayers(layers: LayerConfig[]): string {
    return layers.map((layer, index) => {
      switch (layer.type) {
        case 'linear':
          return `        self.fc${index + 1} = nn.Linear(${layer.config.in_features}, ${layer.config.out_features})`;
        case 'relu':
          return `        self.relu${index + 1} = nn.ReLU()`;
        case 'dropout':
          return `        self.dropout${index + 1} = nn.Dropout(${layer.config.p || 0.5})`;
        default:
          return `        # ${layer.type} layer`;
      }
    }).join('\n');
  }

  static generatePyTorchForward(layers: LayerConfig[]): string {
    let forwardCode = '';
    layers.forEach((layer, index) => {
      switch (layer.type) {
        case 'linear':
          forwardCode += `        x = self.fc${index + 1}(x)\n`;
          break;
        case 'relu':
          forwardCode += `        x = self.relu${index + 1}(x)\n`;
          break;
        case 'dropout':
          forwardCode += `        x = self.dropout${index + 1}(x)\n`;
          break;
      }
    });
    return forwardCode;
  }

  // Utility methods
  static toPascalCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toUpperCase() : word.toLowerCase();
    }).replace(/\s+/g, '');
  }

  static toCamelCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  static toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
  }

  static generateReadme(config: ServiceConfig): string {
    return `# ${config.name}

Generated by ScaleSim

## Description
This is a ${config.framework} service with the following endpoints:

${config.endpoints.map(ep => `- ${ep.method.toUpperCase()} ${ep.path} - ${ep.description}`).join('\n')}

## Getting Started

1. Install dependencies
2. Configure environment variables
3. Run the service

## API Documentation
Visit /api/docs when the service is running.`;
  }

  static generateMLReadme(config: MLModelConfig): string {
    return `# ${config.name} ML Model

Generated by ScaleSim

## Model Type: ${config.taskType}
## Framework: ${config.framework}

## Architecture
${config.architecture.map((layer, i) => `${i + 1}. ${layer.type} - ${JSON.stringify(layer.config)}`).join('\n')}

## Usage
1. Train the model: \`python model.py\`
2. Serve the model: \`python serve.py\`
3. Make predictions: POST to /predict`;
  }

  static generateExpressDockerfile(): string {
    return `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`;
  }

  static generatePyTorchDockerfile(): string {
    return `FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "serve.py"]`;
  }

  static generateEnvExample(config: ServiceConfig): string {
    return `PORT=3000
NODE_ENV=development
${config.database === 'postgresql' ? 'DATABASE_URL=postgresql://user:password@localhost:5432/database' : ''}
${config.authentication === 'jwt' ? 'JWT_SECRET=your-secret-key' : ''}`;
  }

  static generateDjangoDockerfile(): string {
    return `FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]`;
  }

  static generateDjangoEndpoint(endpoint: EndpointConfig): string {
    const decorator = endpoint.method.toLowerCase() === 'get' ? '' : '@csrf_exempt\n';
    return `${decorator}@require_http_methods(["${endpoint.method.toUpperCase()}"])
def ${this.toSnakeCase(endpoint.path)}(request):
    """${endpoint.description}"""
    # TODO: Implement your business logic here
    return JsonResponse({
        'message': 'Success',
        'timestamp': timezone.now().isoformat(),
        'data': json.loads(request.body) if request.body else None
    })`;
  }

  static generateFastAPICode(config: ServiceConfig): { [filename: string]: string } {
    const mainCode = `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
from datetime import datetime

app = FastAPI(title="${config.name}", version="1.0.0", description="Generated by ScaleSim")

# Generated by ScaleSim
${config.endpoints.map(endpoint => this.generateFastAPIEndpoint(endpoint)).join('\n\n')}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)`;

    const requirementsCode = `fastapi>=0.100.0
uvicorn>=0.23.0
pydantic>=2.0.0
${config.database === 'postgresql' ? 'asyncpg>=0.28.0\nsqlalchemy>=2.0.0' : ''}`;

    return {
      'main.py': mainCode,
      'requirements.txt': requirementsCode,
      'Dockerfile': `FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]`,
      'README.md': this.generateReadme(config)
    };
  }

  static generateFastAPIEndpoint(endpoint: EndpointConfig): string {
    const method = endpoint.method.toLowerCase();
    return `@app.${method}("${endpoint.path}")
async def ${this.toSnakeCase(endpoint.path)}():
    """${endpoint.description}"""
    # TODO: Implement your business logic here
    return {
        "message": "Success",
        "timestamp": datetime.now().isoformat()
    }`;
  }

  static generateTensorFlowCode(config: MLModelConfig): { [filename: string]: string } {
    const modelCode = `import tensorflow as tf
from tensorflow import keras
import numpy as np

class ${this.toPascalCase(config.name)}Model:
    def __init__(self):
        self.model = self.build_model()
        
    def build_model(self):
        model = keras.Sequential([
            # Generated architecture
            ${this.generateTensorFlowLayers(config.architecture)}
        ])
        
        model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train(self, x_train, y_train, epochs=${config.hyperparameters.epochs || 10}):
        history = self.model.fit(
            x_train, y_train,
            epochs=epochs,
            batch_size=${config.hyperparameters.batch_size || 32},
            validation_split=0.2,
            verbose=1
        )
        return history
    
    def predict(self, x):
        return self.model.predict(x)
    
    def save(self, path):
        self.model.save(path)

if __name__ == '__main__':
    model = ${this.toPascalCase(config.name)}Model()
    print("Model created successfully!")
    print(model.model.summary())`;

    return {
      'model.py': modelCode,
      'requirements.txt': 'tensorflow>=2.13.0\nnumpy>=1.24.0',
      'README.md': this.generateMLReadme(config)
    };
  }

  static generateTensorFlowLayers(layers: LayerConfig[]): string {
    return layers.map(layer => {
      switch (layer.type) {
        case 'linear':
          return `            keras.layers.Dense(${layer.config.out_features}, activation='linear'),`;
        case 'relu':
          return `            keras.layers.ReLU(),`;
        case 'dropout':
          return `            keras.layers.Dropout(${layer.config.p || 0.5}),`;
        default:
          return `            # ${layer.type} layer`;
      }
    }).join('\n');
  }

  static generateScikitLearnCode(config: MLModelConfig): { [filename: string]: string } {
    const modelCode = `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
import numpy as np
import joblib

class ${this.toPascalCase(config.name)}Model:
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=${config.hyperparameters.n_estimators || 100},
            max_depth=${config.hyperparameters.max_depth || 10},
            random_state=42
        )
        self.scaler = StandardScaler()
        
    def train(self, X, y):
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Model accuracy: {accuracy:.4f}")
        print(classification_report(y_test, y_pred))
        
        return accuracy
    
    def predict(self, X):
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)
    
    def save(self, path):
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler
        }, path)

if __name__ == '__main__':
    model = ${this.toPascalCase(config.name)}Model()
    print("Model created successfully!")`;

    return {
      'model.py': modelCode,
      'requirements.txt': 'scikit-learn>=1.3.0\nnumpy>=1.24.0\njoblib>=1.3.0',
      'README.md': this.generateMLReadme(config)
    };
  }
} 