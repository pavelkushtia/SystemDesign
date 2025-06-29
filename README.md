# 🚀 ScaleSim - Visual Studio for Distributed Systems

> **The first comprehensive platform for designing, simulating, and deploying distributed systems and ML infrastructure visually.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node.js-18.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-18.x-blue.svg)](https://reactjs.org/)

## 🌟 Vision

ScaleSim bridges the gap between system design and reality by providing a **visual, code-first platform** that combines:

- **System Architecture Design** with drag-and-drop components
- **ML Model & Service Builders** with visual programming
- **Performance Simulation** with real-time metrics
- **Production Deployment** with auto-generated Infrastructure as Code

## ✨ Key Features

### 🎨 Visual System Designer
- **Drag & Drop Interface** with React Flow
- **32+ Component Types**: Load balancers, databases, ML models, microservices
- **Real-time Collaboration** with WebSocket synchronization
- **Pattern Library**: Pre-built architecture patterns (microservices, ML pipelines, etc.)

### 🔧 Code Generation & Builders
- **Service Builders**: Spring Boot, Django, Express, FastAPI, Flask, Laravel
- **ML Model Builders**: PyTorch, TensorFlow, Scikit-learn with visual layer design
- **API Designers**: Visual endpoint creation with automatic validation
- **Infrastructure as Code**: Kubernetes, Docker Compose, Terraform generation

### 📊 Performance Simulation Engine
- **Real-time Performance Metrics**: Latency, throughput, resource utilization
- **Load Testing Simulation**: Traffic patterns, failure scenarios
- **Bottleneck Detection**: AI-powered recommendations
- **Cost Estimation**: Multi-cloud pricing analysis

### 🚢 Deployment Automation
- **Multi-target Deployment**: Kubernetes, Docker, AWS ECS, GCP GKE, Azure AKS
- **Environment Management**: Development, staging, production configs
- **Monitoring Integration**: Prometheus, Grafana, custom dashboards
- **GitOps Integration**: Automated CI/CD pipeline generation

### 🤖 AI-Powered Features
- **Smart Recommendations**: Architecture best practices and optimizations
- **Code Generation**: Context-aware boilerplate and documentation
- **Pattern Matching**: Automatic pattern detection and suggestions
- **Anomaly Detection**: Performance and security issue identification

## 🏗️ Three-Tier Architecture

### 🟢 Light Mode (Browser-based)
- **Client-side simulation** using WebAssembly
- **Educational focus** with interactive tutorials
- **Rapid prototyping** for system validation
- **No infrastructure required**

### 🟡 Heavy Mode (Cloud-powered)
- **Kubernetes-based simulation** for enterprise scale
- **Complex workload modeling** with real resource allocation
- **Team collaboration** with shared environments
- **Advanced analytics** and reporting

### 🔴 Deployment Mode (Production-ready)
- **Real infrastructure provisioning** with IaC generation
- **Multi-cloud deployment** support
- **Production monitoring** integration
- **Automated scaling** and management

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Docker** & **Docker Compose** (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/scalesim/scalesim.git
cd scalesim
```

2. **Install dependencies**
```bash
npm run setup
```

3. **Start the development environment**
```bash
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

### Docker Setup (Recommended)

1. **Start with Docker Compose**
```bash
docker-compose up -d
```

2. **Access the application**
- Application: http://localhost:3000
- API: http://localhost:3001

### Production Deployment

1. **Build for production**
```bash
npm run build
```

2. **Deploy with production profile**
```bash
docker-compose --profile production up -d
```

## 📁 Project Structure

```
scalesim/
├── 📁 shared/           # Shared types and utilities
├── 📁 backend/          # Node.js Express API server  
├── 📁 frontend/         # React TypeScript application
├── 📁 patterns/         # Pattern definitions and templates
├── 📁 simulation/       # Performance simulation engine
├── 📁 builders/         # Service and ML model builders
├── 📁 deployment/       # Infrastructure as Code generators
├── 📁 ai-assistant/     # AI-powered code generation
├── 📁 docs/            # Documentation and guides
└── 📁 examples/        # Example system designs
```

## 🎯 Usage Examples

### 1. Design a Microservices Architecture
```typescript
// Create a new system design
const system = await scalesim.createSystem({
  name: "E-commerce Platform",
  mode: "heavy", // Use cloud-powered simulation
  components: [
    { type: "api_gateway", name: "API Gateway" },
    { type: "microservice", name: "User Service" },
    { type: "microservice", name: "Product Service" },
    { type: "database", name: "PostgreSQL" },
    { type: "cache", name: "Redis Cache" }
  ]
});

// Apply microservices patterns
await scalesim.patterns.apply("api-gateway-pattern", system.id);
await scalesim.patterns.apply("circuit-breaker-pattern", system.id);
```

### 2. Build and Deploy ML Pipeline
```typescript
// Create ML model builder
const mlModel = await scalesim.builders.createMLModel({
  name: "Recommendation System",
  framework: "pytorch",
  taskType: "recommendation",
  architecture: {
    layers: [
      { type: "embedding", config: { vocab_size: 10000, embedding_dim: 128 } },
      { type: "linear", config: { in_features: 128, out_features: 64 } },
      { type: "relu" },
      { type: "linear", config: { in_features: 64, out_features: 1 } }
    ]
  }
});

// Generate training and serving code
const code = await scalesim.builders.generateCode(mlModel.id);

// Deploy to Kubernetes
const deployment = await scalesim.deployment.create({
  systemId: system.id,
  target: "kubernetes",
  environment: "production"
});
```

### 3. Run Performance Simulation
```typescript
// Configure simulation parameters
const simulation = await scalesim.simulation.run({
  systemId: system.id,
  duration: 300, // 5 minutes
  users: 1000,
  requestsPerSecond: 100,
  trafficPattern: "spike"
});

// Get performance metrics
const metrics = await scalesim.simulation.getResults(simulation.id);
console.log(`Average latency: ${metrics.latency}ms`);
console.log(`Throughput: ${metrics.throughput} RPS`);
console.log(`Error rate: ${metrics.errorRate}%`);
```

## 🗂️ Pattern Catalog

### Distributed Systems Patterns (10)
- **Sidecar Pattern**: Service mesh integration
- **API Gateway Pattern**: Centralized API management  
- **Load Balancer Pattern**: Traffic distribution
- **Circuit Breaker Pattern**: Fault tolerance
- **Event Sourcing Pattern**: Event-driven architecture
- **CQRS Pattern**: Command query separation
- **Saga Pattern**: Distributed transactions
- **Leader Election Pattern**: Coordination services
- **Bulkhead Pattern**: Failure isolation
- **Strangler Fig Pattern**: Legacy migration

### ML/AI Patterns (10)
- **Feature Store Pattern**: Centralized feature management
- **Model Versioning Pattern**: ML model lifecycle
- **A/B Testing Pattern**: Model comparison
- **Transfer Learning Pattern**: Knowledge reuse
- **Pipeline Pattern**: ML workflow orchestration
- **Ensemble Pattern**: Model combination
- **Real-time Inference Pattern**: Low-latency serving
- **Batch Prediction Pattern**: Bulk processing
- **Monitoring Pattern**: ML observability
- **Feedback Loop Pattern**: Continuous learning

### Microservices Patterns (12)
- **Database per Service**: Data isolation
- **Shared Database**: Legacy integration
- **API Composition**: Data aggregation
- **CQRS**: Read/write separation
- **Event Sourcing**: Audit trails
- **Saga**: Distributed transactions
- **Distributed Tracing**: Request tracking
- **Health Check API**: Service monitoring
- **Blue-Green Deployment**: Zero-downtime deploys
- **Canary Deployment**: Progressive rollouts
- **Service Registry**: Service discovery
- **Config Server**: Centralized configuration

## 🔧 Advanced Configuration

### Environment Variables

```bash
# Backend Configuration
PORT=3001
NODE_ENV=development
DATABASE_PATH=./data/scalesim.db

# AI Features (Optional)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Cloud Providers (Optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
GCP_PROJECT_ID=your-gcp-project
AZURE_SUBSCRIPTION_ID=your-azure-subscription
```

### Custom Patterns

Create custom patterns by extending the base pattern interface:

```typescript
import { Pattern, PatternCategory } from '@scalesim/shared';

export const customPattern: Pattern = {
  id: 'custom-ml-pipeline',
  name: 'Custom ML Pipeline',
  category: PatternCategory.MODEL_TRAINING,
  components: [
    // Define your components
  ],
  connections: [
    // Define connections
  ],
  documentation: {
    overview: 'Custom ML pipeline for specific use case',
    useCases: ['Real-time predictions', 'Batch processing'],
    benefits: ['High performance', 'Cost effective']
  }
};
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests  
npm run test:frontend

# Run with coverage
npm run test:coverage
```

## 📈 Performance Benchmarks

| Metric | Light Mode | Heavy Mode | Production |
|--------|------------|------------|------------|
| Components | 50+ | 500+ | 1000+ |
| Concurrent Users | 10 | 100 | 1000+ |
| Simulation Time | <1s | <30s | <5min |
| Memory Usage | 100MB | 500MB | 2GB+ |

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 📚 Documentation

- [📖 **User Guide**](docs/user-guide.md) - Complete usage documentation
- [🔧 **API Reference**](docs/api-reference.md) - REST API documentation  
- [🏗️ **Architecture Guide**](docs/architecture.md) - System architecture deep dive
- [📦 **Pattern Guide**](docs/patterns.md) - Pattern catalog and usage
- [🚀 **Deployment Guide**](docs/deployment.md) - Production deployment
- [🤖 **AI Features**](docs/ai-features.md) - AI-powered capabilities

## 🛠️ Built With

### Backend
- **Node.js** + **Express** - API server
- **TypeScript** - Type safety
- **SQLite/PostgreSQL** - Database
- **WebSocket** - Real-time communication
- **Zod** - Schema validation

### Frontend  
- **React 18** + **TypeScript** - UI framework
- **React Flow** - Visual diagram editor
- **Monaco Editor** - Code editing
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Query** - API client

### Infrastructure
- **Docker** + **Docker Compose** - Containerization
- **Kubernetes** - Orchestration
- **Nginx** - Reverse proxy
- **Redis** - Caching
- **Prometheus** + **Grafana** - Monitoring

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Flow team for the amazing diagram library
- Monaco Editor team for the VS Code experience
- The open source community for inspiration and tools

## 💬 Support

- 📧 **Email**: support@scalesim.app  
- 💬 **Discord**: [ScaleSim Community](https://discord.gg/scalesim)
- 🐛 **Issues**: [GitHub Issues](https://github.com/scalesim/scalesim/issues)
- 📖 **Docs**: [Documentation Site](https://docs.scalesim.app)

---

<div align="center">

**[⭐ Star us on GitHub](https://github.com/scalesim/scalesim) | [🚀 Try ScaleSim](https://app.scalesim.io) | [📚 Read the Docs](https://docs.scalesim.app)**

*Built with ❤️ for the distributed systems community*

</div>
