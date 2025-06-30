import { Router, Request, Response, NextFunction } from 'express';
import { 
  Pattern, 
  PatternSchema, 
  PatternCategory,
  validateData, 
  generateId, 
  NotFoundError,
  ApiResponse 
} from '@scalesim/shared';
import { database } from '../database/index';
import { logger } from '../utils/logger';

const router = Router();

// ============================================================================
// GET /api/patterns - List all patterns
// ============================================================================
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, category, search, complexity } = req.query;
    
    let sql = `
      SELECT id, name, description, category, template, documentation, 
             performance, implementation, created_at, updated_at
      FROM patterns 
      WHERE 1=1
    `;
    const params: any[] = [];
    
    // Add filters
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (complexity) {
      sql += ' AND JSON_EXTRACT(implementation, "$.complexity") = ?';
      params.push(complexity);
    }
    
    // Add pagination
    const offset = (Number(page) - 1) * Number(limit);
    sql += ' ORDER BY category, name LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);
    
    const patterns = database.prepare(sql).all(...params);
    
    // Parse JSON fields
    const parsedPatterns = patterns.map((pattern: any) => ({
      ...pattern,
      components: JSON.parse(pattern.components || '[]'),
      connections: JSON.parse(pattern.connections || '[]'),
      template: JSON.parse(pattern.template || '{}'),
      documentation: JSON.parse(pattern.documentation || '{}'),
      performance: JSON.parse(pattern.performance || '{}'),
      implementation: JSON.parse(pattern.implementation || '{}'),
      created_at: new Date(pattern.created_at),
      updated_at: new Date(pattern.updated_at)
    }));
    
    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM patterns WHERE 1=1';
    const countParams: any[] = [];
    
    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }
    
    if (search) {
      countSql += ' AND (name LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (complexity) {
      countSql += ' AND JSON_EXTRACT(implementation, "$.complexity") = ?';
      countParams.push(complexity);
    }
    
    const { total } = database.prepare(countSql).get(...countParams) as { total: number };
    
    const response: ApiResponse = {
      success: true,
      data: {
        patterns: parsedPatterns,
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
// GET /api/patterns/categories - Get pattern categories
// ============================================================================
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = Object.values(PatternCategory).map(category => ({
      id: category,
      name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: getCategoryDescription(category)
    }));
    
    // Get count for each category
    const categoryCounts = database.prepare(`
      SELECT category, COUNT(*) as count 
      FROM patterns 
      GROUP BY category
    `).all() as Array<{ category: string; count: number }>;
    
    const categoryMap = new Map(categoryCounts.map(c => [c.category, c.count]));
    
    const categoriesWithCounts = categories.map(category => ({
      ...category,
      count: categoryMap.get(category.id) || 0
    }));
    
    const response: ApiResponse = {
      success: true,
      data: categoriesWithCounts,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/patterns/:id - Get a specific pattern
// ============================================================================
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const pattern = database.prepare(`
      SELECT * FROM patterns WHERE id = ?
    `).get(id);
    
    if (!pattern) {
      throw new NotFoundError('Pattern');
    }
    
    // Parse JSON fields
    const parsedPattern = {
      ...pattern,
      components: JSON.parse((pattern as any).components || '[]'),
      connections: JSON.parse((pattern as any).connections || '[]'),
      template: JSON.parse((pattern as any).template || '{}'),
      documentation: JSON.parse((pattern as any).documentation || '{}'),
      performance: JSON.parse((pattern as any).performance || '{}'),
      implementation: JSON.parse((pattern as any).implementation || '{}'),
      created_at: new Date((pattern as any).created_at),
      updated_at: new Date((pattern as any).updated_at)
    };
    
    const response: ApiResponse = {
      success: true,
      data: parsedPattern,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/patterns - Create a new pattern
// ============================================================================
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patternData = {
      id: generateId(),
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Validate the pattern
    const validatedPattern = validateData(PatternSchema, patternData);
    
    // Insert into database
    const insertStmt = database.prepare(`
      INSERT INTO patterns (
        id, name, description, category, components, connections, 
        template, documentation, performance, implementation, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      validatedPattern.id,
      validatedPattern.name,
      validatedPattern.description,
      validatedPattern.category,
      JSON.stringify(validatedPattern.components),
      JSON.stringify(validatedPattern.connections),
      JSON.stringify(validatedPattern.template),
      JSON.stringify(validatedPattern.documentation),
      JSON.stringify(validatedPattern.performance || {}),
      JSON.stringify(validatedPattern.implementation),
      validatedPattern.created_at.toISOString(),
      validatedPattern.updated_at.toISOString()
    );
    
    logger.info(`Pattern created: ${validatedPattern.id} - ${validatedPattern.name}`);
    
    const response: ApiResponse = {
      success: true,
      data: validatedPattern,
      timestamp: new Date()
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PUT /api/patterns/:id - Update a pattern
// ============================================================================
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if pattern exists
    const existingPattern = database.prepare('SELECT * FROM patterns WHERE id = ?').get(id);
    if (!existingPattern) {
      throw new NotFoundError('Pattern');
    }
    
    const patternData = {
      ...req.body,
      id,
      updated_at: new Date()
    };
    
    // Validate the updated pattern
    const validatedPattern = validateData(PatternSchema, patternData);
    
    // Update in database
    const updateStmt = database.prepare(`
      UPDATE patterns SET 
        name = ?, description = ?, category = ?, components = ?, 
        connections = ?, template = ?, documentation = ?, 
        performance = ?, implementation = ?, updated_at = ?
      WHERE id = ?
    `);
    
    updateStmt.run(
      validatedPattern.name,
      validatedPattern.description,
      validatedPattern.category,
      JSON.stringify(validatedPattern.components),
      JSON.stringify(validatedPattern.connections),
      JSON.stringify(validatedPattern.template),
      JSON.stringify(validatedPattern.documentation),
      JSON.stringify(validatedPattern.performance || {}),
      JSON.stringify(validatedPattern.implementation),
      validatedPattern.updated_at.toISOString(),
      id
    );
    
    logger.info(`Pattern updated: ${id} - ${validatedPattern.name}`);
    
    const response: ApiResponse = {
      success: true,
      data: validatedPattern,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// DELETE /api/patterns/:id - Delete a pattern
// ============================================================================
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check if pattern exists
    const existingPattern = database.prepare('SELECT name FROM patterns WHERE id = ?').get(id);
    if (!existingPattern) {
      throw new NotFoundError('Pattern');
    }
    
    // Delete the pattern
    const deleteStmt = database.prepare('DELETE FROM patterns WHERE id = ?');
    const result = deleteStmt.run(id);
    
    if (result.changes === 0) {
      throw new NotFoundError('Pattern');
    }
    
    logger.info(`Pattern deleted: ${id} - ${(existingPattern as any).name}`);
    
    const response: ApiResponse = {
      success: true,
      data: { message: 'Pattern deleted successfully' },
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/patterns/:id/apply - Apply pattern to system
// ============================================================================
router.post('/:id/apply', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { systemId, variables = {} } = req.body;
    
    // Get the pattern
    const pattern = database.prepare('SELECT * FROM patterns WHERE id = ?').get(id);
    if (!pattern) {
      throw new NotFoundError('Pattern');
    }
    
    // Get the target system
    const system = database.prepare('SELECT * FROM systems WHERE id = ?').get(systemId);
    if (!system) {
      throw new NotFoundError('System design');
    }
    
    // Parse pattern data
    const parsedPattern = {
      ...pattern,
      components: JSON.parse((pattern as any).components || '[]'),
      connections: JSON.parse((pattern as any).connections || '[]'),
      template: JSON.parse((pattern as any).template || '{}')
    };
    
    // Parse system data
    const parsedSystem = {
      ...system,
      components: JSON.parse((system as any).components || '[]'),
      connections: JSON.parse((system as any).connections || '[]'),
      patterns: JSON.parse((system as any).patterns || '[]')
    };
    
    // Apply pattern variables to components and connections
    const appliedComponents = applyPatternVariables(
      parsedPattern.components, 
      variables, 
      parsedPattern.template.variables || {}
    );
    
    const appliedConnections = applyPatternVariables(
      parsedPattern.connections, 
      variables, 
      parsedPattern.template.variables || {}
    );
    
    // Merge with existing system
    const updatedComponents = [...parsedSystem.components, ...appliedComponents];
    const updatedConnections = [...parsedSystem.connections, ...appliedConnections];
    const updatedPatterns = [...parsedSystem.patterns, id];
    
    // Update the system
    const updateStmt = database.prepare(`
      UPDATE systems SET 
        components = ?, connections = ?, patterns = ?, updated_at = ?
      WHERE id = ?
    `);
    
    const now = new Date().toISOString();
    updateStmt.run(
      JSON.stringify(updatedComponents),
      JSON.stringify(updatedConnections),
      JSON.stringify(updatedPatterns),
      now,
      systemId
    );
    
    logger.info(`Pattern ${id} applied to system ${systemId}`);
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Pattern applied successfully',
        addedComponents: appliedComponents.length,
        addedConnections: appliedConnections.length
      },
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

function getCategoryDescription(category: PatternCategory): string {
  const descriptions: Record<PatternCategory, string> = {
    [PatternCategory.SINGLE_NODE]: 'Patterns for single-node applications and services',
    [PatternCategory.SERVING]: 'Patterns for serving and handling requests',
    [PatternCategory.BATCH_COMPUTATIONAL]: 'Patterns for batch processing and computation',
    [PatternCategory.EVENT_DRIVEN]: 'Patterns for event-driven architectures',
    [PatternCategory.MULTI_NODE]: 'Patterns for multi-node distributed systems',
    [PatternCategory.DATA_REPRESENTATION]: 'Patterns for data modeling and representation',
    [PatternCategory.PROBLEM_REPRESENTATION]: 'Patterns for problem modeling in ML',
    [PatternCategory.MODEL_TRAINING]: 'Patterns for machine learning model training',
    [PatternCategory.MODEL_SERVING_PATTERN]: 'Patterns for serving ML models',
    [PatternCategory.WORKFLOW]: 'Patterns for ML and data workflows',
    [PatternCategory.DECOMPOSITION]: 'Patterns for service decomposition',
    [PatternCategory.DATA_MANAGEMENT]: 'Patterns for data management in microservices',
    [PatternCategory.COMMUNICATION]: 'Patterns for inter-service communication',
    [PatternCategory.RELIABILITY]: 'Patterns for system reliability',
    [PatternCategory.OBSERVABILITY]: 'Patterns for monitoring and observability',
    [PatternCategory.DEPLOYMENT]: 'Patterns for deployment and infrastructure'
  };
  
  return descriptions[category] || 'Pattern category';
}

function applyPatternVariables(
  items: any[], 
  variables: Record<string, any>, 
  templateVariables: Record<string, any>
): any[] {
  return items.map(item => {
    const processed = JSON.parse(JSON.stringify(item));
    
    // Generate new IDs for components/connections
    if (processed.id) {
      processed.id = generateId();
    }
    
    // Apply variable substitution
    const itemStr = JSON.stringify(processed);
    let substituted = itemStr;
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      substituted = substituted.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // Apply default values for unset variables
    Object.entries(templateVariables).forEach(([key, defaultValue]) => {
      if (!(key in variables)) {
        const placeholder = `{{${key}}}`;
        substituted = substituted.replace(new RegExp(placeholder, 'g'), defaultValue);
      }
    });
    
    return JSON.parse(substituted);
  });
}

export default router; 