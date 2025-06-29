import { Router, Request, Response, NextFunction } from 'express';
import { 
  SystemDesign, 
  SystemDesignSchema, 
  validateData, 
  generateId, 
  NotFoundError,
  ApiResponse 
} from '@scalesim/shared';
import { database } from '../database/index';
import { logger } from '../utils/logger';

const router = Router();

// ============================================================================
// GET /api/systems - List all system designs
// ============================================================================
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, mode, author, search } = req.query;
    
    let sql = `
      SELECT id, name, description, version, mode, patterns, tags, author, 
             created_at, updated_at
      FROM systems 
      WHERE 1=1
    `;
    const params: any[] = [];
    
    // Add filters
    if (mode) {
      sql += ' AND mode = ?';
      params.push(mode);
    }
    
    if (author) {
      sql += ' AND author = ?';
      params.push(author);
    }
    
    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Add pagination
    const offset = (Number(page) - 1) * Number(limit);
    sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);
    
    const systems = database.prepare(sql).all(...params);
    
    // Parse JSON fields
    const parsedSystems = systems.map((system: any) => ({
      ...system,
      patterns: JSON.parse(system.patterns || '[]'),
      tags: JSON.parse(system.tags || '[]'),
      created_at: new Date(system.created_at),
      updated_at: new Date(system.updated_at)
    }));
    
    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM systems WHERE 1=1';
    const countParams: any[] = [];
    
    if (mode) {
      countSql += ' AND mode = ?';
      countParams.push(mode);
    }
    
    if (author) {
      countSql += ' AND author = ?';
      countParams.push(author);
    }
    
    if (search) {
      countSql += ' AND (name LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const { total } = database.prepare(countSql).get(...countParams) as { total: number };
    
    const response: ApiResponse = {
      success: true,
      data: {
        systems: parsedSystems,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      },
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/systems/:id - Get a specific system design
// ============================================================================
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const system = database.prepare(`
      SELECT * FROM systems WHERE id = ?
    `).get(id);
    
    if (!system) {
      throw new NotFoundError('System design');
    }
    
    // Parse JSON fields
    const parsedSystem = {
      ...system,
      components: JSON.parse((system as any).components || '[]'),
      connections: JSON.parse((system as any).connections || '[]'),
      patterns: JSON.parse((system as any).patterns || '[]'),
      tags: JSON.parse((system as any).tags || '[]'),
      created_at: new Date((system as any).created_at),
      updated_at: new Date((system as any).updated_at)
    };
    
    const response: ApiResponse = {
      success: true,
      data: parsedSystem,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/systems - Create a new system design
// ============================================================================
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const systemData = {
      id: generateId(),
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Validate the system design
    const validatedSystem = validateData(SystemDesignSchema, systemData);
    
    // Insert into database
    const insertStmt = database.prepare(`
      INSERT INTO systems (
        id, name, description, version, mode, components, connections, 
        patterns, tags, author, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      validatedSystem.id,
      validatedSystem.name,
      validatedSystem.description || null,
      validatedSystem.version,
      validatedSystem.mode,
      JSON.stringify(validatedSystem.components),
      JSON.stringify(validatedSystem.connections),
      JSON.stringify(validatedSystem.patterns),
      JSON.stringify(validatedSystem.tags),
      validatedSystem.author || null,
      validatedSystem.created_at.toISOString(),
      validatedSystem.updated_at.toISOString()
    );
    
    logger.info(`System design created: ${validatedSystem.id} - ${validatedSystem.name}`);
    
    const response: ApiResponse = {
      success: true,
      data: validatedSystem,
      timestamp: new Date()
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PUT /api/systems/:id - Update a system design
// ============================================================================
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if system exists
    const existingSystem = database.prepare('SELECT * FROM systems WHERE id = ?').get(id);
    if (!existingSystem) {
      throw new NotFoundError('System design');
    }
    
    const systemData = {
      ...req.body,
      id,
      updated_at: new Date()
    };
    
    // Validate the updated system design
    const validatedSystem = validateData(SystemDesignSchema, systemData);
    
    // Update in database
    const updateStmt = database.prepare(`
      UPDATE systems SET 
        name = ?, description = ?, version = ?, mode = ?, 
        components = ?, connections = ?, patterns = ?, tags = ?, 
        author = ?, updated_at = ?
      WHERE id = ?
    `);
    
    updateStmt.run(
      validatedSystem.name,
      validatedSystem.description || null,
      validatedSystem.version,
      validatedSystem.mode,
      JSON.stringify(validatedSystem.components),
      JSON.stringify(validatedSystem.connections),
      JSON.stringify(validatedSystem.patterns),
      JSON.stringify(validatedSystem.tags),
      validatedSystem.author || null,
      validatedSystem.updated_at.toISOString(),
      id
    );
    
    logger.info(`System design updated: ${id} - ${validatedSystem.name}`);
    
    const response: ApiResponse = {
      success: true,
      data: validatedSystem,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// DELETE /api/systems/:id - Delete a system design
// ============================================================================
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if system exists
    const existingSystem = database.prepare('SELECT name FROM systems WHERE id = ?').get(id);
    if (!existingSystem) {
      throw new NotFoundError('System design');
    }
    
    // Delete the system (cascade will handle related records)
    const deleteStmt = database.prepare('DELETE FROM systems WHERE id = ?');
    const result = deleteStmt.run(id);
    
    if (result.changes === 0) {
      throw new NotFoundError('System design');
    }
    
    logger.info(`System design deleted: ${id} - ${(existingSystem as any).name}`);
    
    const response: ApiResponse = {
      success: true,
      data: { message: 'System design deleted successfully' },
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/systems/:id/duplicate - Duplicate a system design
// ============================================================================
router.post('/:id/duplicate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Get original system
    const originalSystem = database.prepare('SELECT * FROM systems WHERE id = ?').get(id);
    if (!originalSystem) {
      throw new NotFoundError('System design');
    }
    
    // Create duplicate
    const duplicateSystem = {
      ...originalSystem,
      id: generateId(),
      name: name || `${(originalSystem as any).name} (Copy)`,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Insert duplicate
    const insertStmt = database.prepare(`
      INSERT INTO systems (
        id, name, description, version, mode, components, connections, 
        patterns, tags, author, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      duplicateSystem.id,
      duplicateSystem.name,
      (duplicateSystem as any).description,
      (duplicateSystem as any).version,
      (duplicateSystem as any).mode,
      (duplicateSystem as any).components,
      (duplicateSystem as any).connections,
      (duplicateSystem as any).patterns,
      (duplicateSystem as any).tags,
      (duplicateSystem as any).author,
      duplicateSystem.created_at.toISOString(),
      duplicateSystem.updated_at.toISOString()
    );
    
    // Parse JSON fields for response
    const parsedDuplicate = {
      ...duplicateSystem,
      components: JSON.parse((duplicateSystem as any).components || '[]'),
      connections: JSON.parse((duplicateSystem as any).connections || '[]'),
      patterns: JSON.parse((duplicateSystem as any).patterns || '[]'),
      tags: JSON.parse((duplicateSystem as any).tags || '[]')
    };
    
    logger.info(`System design duplicated: ${id} -> ${duplicateSystem.id}`);
    
    const response: ApiResponse = {
      success: true,
      data: parsedDuplicate,
      timestamp: new Date()
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

export default router; 