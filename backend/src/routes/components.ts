import { Router, Request, Response, NextFunction } from 'express';
import { 
  ComponentConfig, 
  ComponentConfigSchema, 
  ComponentType,
  validateData, 
  generateId, 
  NotFoundError,
  ApiResponse 
} from '@scalesim/shared';
import { database } from '../database/index';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/components - List all components
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, type, search } = req.query;
    
    let sql = 'SELECT * FROM components WHERE 1=1';
    const params: any[] = [];
    
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    
    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    const offset = (Number(page) - 1) * Number(limit);
    sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);
    
    const components = database.prepare(sql).all(...params);
    
    const parsedComponents = components.map((comp: any) => ({
      ...comp,
      position: { x: comp.position_x, y: comp.position_y },
      config: JSON.parse(comp.config || '{}'),
      resources: comp.resources ? JSON.parse(comp.resources) : undefined,
      tags: JSON.parse(comp.tags || '[]'),
      metadata: comp.metadata ? JSON.parse(comp.metadata) : undefined,
      created_at: new Date(comp.created_at),
      updated_at: new Date(comp.updated_at)
    }));
    
    res.json({
      success: true,
      data: { components: parsedComponents },
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/components - Create component
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const componentData = {
      id: generateId(),
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const validatedComponent = validateData(ComponentConfigSchema, componentData);
    
    const insertStmt = database.prepare(`
      INSERT INTO components (
        id, type, name, description, version, position_x, position_y,
        config, resources, tags, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      validatedComponent.id,
      validatedComponent.type,
      validatedComponent.name,
      validatedComponent.description || null,
      validatedComponent.version,
      validatedComponent.position.x,
      validatedComponent.position.y,
      JSON.stringify(validatedComponent.config),
      validatedComponent.resources ? JSON.stringify(validatedComponent.resources) : null,
      JSON.stringify(validatedComponent.tags),
      validatedComponent.metadata ? JSON.stringify(validatedComponent.metadata) : null,
      validatedComponent.created_at.toISOString(),
      validatedComponent.updated_at.toISOString()
    );
    
    logger.info(`Component created: ${validatedComponent.id} - ${validatedComponent.name}`);
    
    res.status(201).json({
      success: true,
      data: validatedComponent,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

export default router; 