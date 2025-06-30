import { Router, Request, Response, NextFunction } from 'express';
import { 
  ServiceBuilderConfig, 
  MLModelConfig,
  FrameworkType,
  generateId, 
  NotFoundError,
  ApiResponse 
} from '@scalesim/shared';
import { database } from '../database/index';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/builders/services - List service builders
router.get('/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = database.prepare('SELECT * FROM service_builders ORDER BY updated_at DESC').all();
    
    const parsedServices = services.map((service: any) => ({
      ...service,
      endpoints: JSON.parse(service.endpoints || '[]'),
      database_config: service.database_config ? JSON.parse(service.database_config) : undefined,
      generated_code: service.generated_code ? JSON.parse(service.generated_code) : undefined,
      created_at: new Date(service.created_at),
      updated_at: new Date(service.updated_at)
    }));
    
    res.json({
      success: true,
      data: { services: parsedServices },
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/builders/ml-models - List ML model builders
router.get('/ml-models', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const models = database.prepare('SELECT * FROM ml_models ORDER BY updated_at DESC').all();
    
    const parsedModels = models.map((model: any) => ({
      ...model,
      architecture: JSON.parse(model.architecture || '{}'),
      training: JSON.parse(model.training || '{}'),
      serving: model.serving ? JSON.parse(model.serving) : undefined,
      generated_code: model.generated_code ? JSON.parse(model.generated_code) : undefined,
      created_at: new Date(model.created_at),
      updated_at: new Date(model.updated_at)
    }));
    
    res.json({
      success: true,
      data: { models: parsedModels },
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/builders/services - Create service builder
router.post('/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceData = {
      id: generateId(),
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const insertStmt = database.prepare(`
      INSERT INTO service_builders (
        id, name, framework, endpoints, database_config, 
        generated_code, docker_config, kubernetes_config, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      serviceData.id,
      serviceData.name,
      serviceData.framework,
      JSON.stringify(serviceData.endpoints || []),
      serviceData.database ? JSON.stringify(serviceData.database) : null,
      serviceData.generatedCode ? JSON.stringify(serviceData.generatedCode) : null,
      serviceData.dockerConfig || null,
      serviceData.kubernetesConfig || null,
      serviceData.created_at.toISOString(),
      serviceData.updated_at.toISOString()
    );
    
    logger.info(`Service builder created: ${serviceData.id} - ${serviceData.name}`);
    
    res.status(201).json({
      success: true,
      data: serviceData,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

export default router; 