import Database from 'better-sqlite3';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

const DATABASE_PATH = process.env.DATABASE_PATH || './data/scalesim.db';
const NODE_ENV = process.env.NODE_ENV || 'development';

class DatabaseManager {
  private db: Database.Database | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Ensure database directory exists
      const dbDir = path.dirname(DATABASE_PATH);
      await fs.mkdir(dbDir, { recursive: true });

      // Initialize SQLite database
      this.db = new Database(DATABASE_PATH);
      
      // Enable WAL mode for better performance
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 1000000');
      this.db.pragma('temp_store = memory');

      // Create tables
      await this.createTables();
      
      // Seed initial data in development
      if (NODE_ENV === 'development') {
        await this.seedDatabase();
      }

      this.initialized = true;
      logger.info(`Database initialized at ${DATABASE_PATH}`);
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create tables for all entities
    const tables = [
      // System designs table
      `CREATE TABLE IF NOT EXISTS systems (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        version TEXT DEFAULT '1.0.0',
        mode TEXT NOT NULL CHECK (mode IN ('light', 'heavy', 'deployment')),
        components TEXT NOT NULL DEFAULT '[]',
        connections TEXT NOT NULL DEFAULT '[]',
        patterns TEXT NOT NULL DEFAULT '[]',
        tags TEXT NOT NULL DEFAULT '[]',
        author TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Components table
      `CREATE TABLE IF NOT EXISTS components (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        version TEXT DEFAULT '1.0.0',
        position_x REAL NOT NULL,
        position_y REAL NOT NULL,
        config TEXT NOT NULL DEFAULT '{}',
        resources TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Patterns table
      `CREATE TABLE IF NOT EXISTS patterns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        components TEXT NOT NULL DEFAULT '[]',
        connections TEXT NOT NULL DEFAULT '[]',
        template TEXT NOT NULL DEFAULT '{}',
        documentation TEXT NOT NULL DEFAULT '{}',
        performance TEXT,
        implementation TEXT NOT NULL DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Service builders table
      `CREATE TABLE IF NOT EXISTS service_builders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        framework TEXT NOT NULL,
        endpoints TEXT NOT NULL DEFAULT '[]',
        database_config TEXT,
        generated_code TEXT,
        docker_config TEXT,
        kubernetes_config TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // ML model builders table
      `CREATE TABLE IF NOT EXISTS ml_models (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        task_type TEXT NOT NULL,
        framework TEXT NOT NULL,
        architecture TEXT NOT NULL DEFAULT '{}',
        training TEXT NOT NULL DEFAULT '{}',
        serving TEXT,
        generated_code TEXT,
        training_script TEXT,
        serving_script TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Simulations table
      `CREATE TABLE IF NOT EXISTS simulations (
        id TEXT PRIMARY KEY,
        system_id TEXT NOT NULL,
        duration INTEGER DEFAULT 60,
        users INTEGER DEFAULT 100,
        requests_per_second INTEGER DEFAULT 10,
        traffic_pattern TEXT DEFAULT 'constant',
        failure_scenarios TEXT NOT NULL DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (system_id) REFERENCES systems (id)
      )`,

      // Simulation results table
      `CREATE TABLE IF NOT EXISTS simulation_results (
        id TEXT PRIMARY KEY,
        config_id TEXT NOT NULL,
        metrics TEXT NOT NULL DEFAULT '{}',
        component_metrics TEXT NOT NULL DEFAULT '{}',
        resource_utilization TEXT NOT NULL DEFAULT '{}',
        bottlenecks TEXT NOT NULL DEFAULT '[]',
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        duration INTEGER NOT NULL,
        FOREIGN KEY (config_id) REFERENCES simulations (id)
      )`,

      // Deployments table
      `CREATE TABLE IF NOT EXISTS deployments (
        id TEXT PRIMARY KEY,
        system_id TEXT NOT NULL,
        target TEXT NOT NULL,
        config TEXT NOT NULL DEFAULT '{}',
        manifests TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'deployed', 'failed')),
        deployed_at DATETIME,
        environment TEXT DEFAULT 'development',
        secrets TEXT NOT NULL DEFAULT '[]',
        config_maps TEXT NOT NULL DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (system_id) REFERENCES systems (id)
      )`
    ];

    // Execute table creation
    for (const tableSQL of tables) {
      this.db.exec(tableSQL);
    }

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_systems_author ON systems (author)',
      'CREATE INDEX IF NOT EXISTS idx_systems_mode ON systems (mode)',
      'CREATE INDEX IF NOT EXISTS idx_components_type ON components (type)',
      'CREATE INDEX IF NOT EXISTS idx_patterns_category ON patterns (category)',
      'CREATE INDEX IF NOT EXISTS idx_simulations_system_id ON simulations (system_id)',
      'CREATE INDEX IF NOT EXISTS idx_simulation_results_config_id ON simulation_results (config_id)',
      'CREATE INDEX IF NOT EXISTS idx_deployments_system_id ON deployments (system_id)',
      'CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments (status)'
    ];

    for (const indexSQL of indexes) {
      this.db.exec(indexSQL);
    }

    logger.info('Database tables and indexes created successfully');
  }

  private async seedDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if data already exists
    const systemCount = this.db.prepare('SELECT COUNT(*) as count FROM systems').get() as { count: number };
    
    if (systemCount.count > 0) {
      logger.info('Database already seeded, skipping...');
      return;
    }

    // Seed some example data
    try {
      // Insert example system
      const insertSystem = this.db.prepare(`
        INSERT INTO systems (id, name, description, mode, components, connections, patterns, author)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertSystem.run(
        'example-microservices-system',
        'E-commerce Microservices',
        'Example e-commerce system with microservices architecture',
        'light',
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify(['api-gateway', 'microservices']),
        'System Administrator'
      );

      logger.info('Database seeded with example data');
    } catch (error) {
      logger.warn('Failed to seed database:', error);
    }
  }

  getDatabase(): Database.Database {
    if (!this.db || !this.initialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
      logger.info('Database connection closed');
    }
  }

  // Utility methods for common operations
  
  beginTransaction() {
    return this.getDatabase().transaction(() => {});
  }

  prepare(sql: string) {
    return this.getDatabase().prepare(sql);
  }

  exec(sql: string) {
    return this.getDatabase().exec(sql);
  }
}

// Export singleton instance
export const database = new DatabaseManager(); 