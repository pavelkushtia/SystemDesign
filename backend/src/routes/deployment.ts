import { Router, Request, Response, NextFunction } from 'express';
import { 
  DeploymentConfig, 
  DeploymentTarget,
  generateId, 
  NotFoundError,
  ApiResponse 
} from '@scalesim/shared';
import { database } from '../database/index';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/deployment/generate - Generate deployment manifests
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { systemId, target, environment = 'development', ...config } = req.body;
    
    // Get the system design
    const system = database.prepare('SELECT * FROM systems WHERE id = ?').get(systemId);
    if (!system) {
      throw new NotFoundError('System design');
    }
    
    // Parse system data
    const parsedSystem = {
      ...system,
      components: JSON.parse((system as any).components || '[]'),
      connections: JSON.parse((system as any).connections || '[]')
    };
    
    // Generate manifests based on target
    const manifests = await generateManifests(parsedSystem, target, config);
    
    // Create deployment config
    const deploymentConfig = {
      id: generateId(),
      systemId,
      target,
      config,
      manifests,
      status: 'pending',
      environment,
      secrets: config.secrets || [],
      configMaps: config.configMaps || [],
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Insert deployment config
    const insertStmt = database.prepare(`
      INSERT INTO deployments (
        id, system_id, target, config, manifests, status, 
        environment, secrets, config_maps, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      deploymentConfig.id,
      deploymentConfig.systemId,
      deploymentConfig.target,
      JSON.stringify(deploymentConfig.config),
      JSON.stringify(deploymentConfig.manifests),
      deploymentConfig.status,
      deploymentConfig.environment,
      JSON.stringify(deploymentConfig.secrets),
      JSON.stringify(deploymentConfig.configMaps),
      deploymentConfig.created_at.toISOString(),
      deploymentConfig.updated_at.toISOString()
    );
    
    logger.info(`Deployment manifests generated: ${deploymentConfig.id} for system ${systemId}`);
    
    res.json({
      success: true,
      data: deploymentConfig,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/deployment/:id - Get deployment config
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const deployment = database.prepare('SELECT * FROM deployments WHERE id = ?').get(id);
    if (!deployment) {
      throw new NotFoundError('Deployment');
    }
    
    const parsedDeployment = {
      ...deployment,
      config: JSON.parse((deployment as any).config || '{}'),
      manifests: JSON.parse((deployment as any).manifests || '{}'),
      secrets: JSON.parse((deployment as any).secrets || '[]'),
      config_maps: JSON.parse((deployment as any).config_maps || '[]'),
      created_at: new Date((deployment as any).created_at),
      updated_at: new Date((deployment as any).updated_at),
      deployed_at: (deployment as any).deployed_at ? new Date((deployment as any).deployed_at) : undefined
    };
    
    res.json({
      success: true,
      data: parsedDeployment,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to generate manifests
async function generateManifests(system: any, target: DeploymentTarget, config: any): Promise<Record<string, string>> {
  const manifests: Record<string, string> = {};
  
  if (target === DeploymentTarget.KUBERNETES) {
    // Generate Kubernetes manifests
    manifests['namespace.yaml'] = `
apiVersion: v1
kind: Namespace
metadata:
  name: ${config.namespace || 'scalesim'}
---`;
    
    // Generate deployment for each component
    system.components.forEach((component: any, index: number) => {
      manifests[`${component.name}-deployment.yaml`] = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${component.name}
  namespace: ${config.namespace || 'scalesim'}
spec:
  replicas: ${component.resources?.replicas || 1}
  selector:
    matchLabels:
      app: ${component.name}
  template:
    metadata:
      labels:
        app: ${component.name}
    spec:
      containers:
      - name: ${component.name}
        image: ${component.config.image || 'nginx:latest'}
        ports:
        - containerPort: ${component.config.port || 80}
        resources:
          requests:
            cpu: ${component.resources?.cpu || '100m'}
            memory: ${component.resources?.memory || '128Mi'}
          limits:
            cpu: ${component.resources?.cpu || '500m'}
            memory: ${component.resources?.memory || '512Mi'}
---`;
      
      manifests[`${component.name}-service.yaml`] = `
apiVersion: v1
kind: Service
metadata:
  name: ${component.name}
  namespace: ${config.namespace || 'scalesim'}
spec:
  selector:
    app: ${component.name}
  ports:
  - port: ${component.config.port || 80}
    targetPort: ${component.config.port || 80}
  type: ClusterIP
---`;
    });
  } else if (target === DeploymentTarget.DOCKER_COMPOSE) {
    // Generate Docker Compose file
    const services: Record<string, any> = {};
    
    system.components.forEach((component: any) => {
      services[component.name] = {
        image: component.config.image || 'nginx:latest',
        ports: [`${component.config.port || 80}:${component.config.port || 80}`],
        environment: component.config.environment || {},
        restart: 'unless-stopped'
      };
    });
    
    manifests['docker-compose.yml'] = `
version: '3.8'
services:
${Object.entries(services).map(([name, service]) => `
  ${name}:
    image: ${service.image}
    ports:
      - "${service.ports[0]}"
    restart: ${service.restart}
`).join('')}
`;
  }
  
  return manifests;
}

export default router; 