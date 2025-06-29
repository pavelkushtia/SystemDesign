import { Router, Request, Response, NextFunction } from 'express';
import { 
  SimulationConfig, 
  SimulationResult,
  generateId, 
  NotFoundError,
  ApiResponse,
  calculateSystemPerformance,
  generatePerformanceRecommendations
} from '@scalesim/shared';
import { database } from '../database/index';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/simulation/run - Run simulation
router.post('/run', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { systemId, ...simulationParams } = req.body;
    
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
    
    // Create simulation config
    const simulationConfig = {
      id: generateId(),
      systemId,
      ...simulationParams,
      created_at: new Date()
    };
    
    // Insert simulation config
    const insertConfigStmt = database.prepare(`
      INSERT INTO simulations (
        id, system_id, duration, users, requests_per_second, 
        traffic_pattern, failure_scenarios, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertConfigStmt.run(
      simulationConfig.id,
      simulationConfig.systemId,
      simulationConfig.duration || 60,
      simulationConfig.users || 100,
      simulationConfig.requestsPerSecond || 10,
      simulationConfig.trafficPattern || 'constant',
      JSON.stringify(simulationConfig.failureScenarios || []),
      simulationConfig.created_at.toISOString()
    );
    
    // Run simulation (simplified)
    const performanceMetrics = calculateSystemPerformance(
      parsedSystem.components,
      parsedSystem.connections
    );
    
    const recommendations = generatePerformanceRecommendations(
      performanceMetrics,
      parsedSystem.components
    );
    
    // Create simulation result
    const simulationResult = {
      id: generateId(),
      configId: simulationConfig.id,
      metrics: performanceMetrics,
      componentMetrics: {},
      resourceUtilization: {
        totalCPU: 8,
        totalMemory: 16384,
        totalStorage: 500,
        estimatedCost: 50.25
      },
      bottlenecks: recommendations,
      executedAt: new Date(),
      duration: simulationConfig.duration || 60
    };
    
    // Insert simulation result
    const insertResultStmt = database.prepare(`
      INSERT INTO simulation_results (
        id, config_id, metrics, component_metrics, resource_utilization,
        bottlenecks, executed_at, duration
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertResultStmt.run(
      simulationResult.id,
      simulationResult.configId,
      JSON.stringify(simulationResult.metrics),
      JSON.stringify(simulationResult.componentMetrics),
      JSON.stringify(simulationResult.resourceUtilization),
      JSON.stringify(simulationResult.bottlenecks),
      simulationResult.executedAt.toISOString(),
      simulationResult.duration
    );
    
    logger.info(`Simulation completed: ${simulationResult.id} for system ${systemId}`);
    
    res.json({
      success: true,
      data: simulationResult,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/simulation/results/:id - Get simulation result
router.get('/results/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const result = database.prepare('SELECT * FROM simulation_results WHERE id = ?').get(id);
    if (!result) {
      throw new NotFoundError('Simulation result');
    }
    
    const parsedResult = {
      ...result,
      metrics: JSON.parse((result as any).metrics || '{}'),
      component_metrics: JSON.parse((result as any).component_metrics || '{}'),
      resource_utilization: JSON.parse((result as any).resource_utilization || '{}'),
      bottlenecks: JSON.parse((result as any).bottlenecks || '[]'),
      executed_at: new Date((result as any).executed_at),
    };
    
    res.json({
      success: true,
      data: parsedResult,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

export default router; 