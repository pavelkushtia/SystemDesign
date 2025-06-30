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
      // ============================================================================
      // USER AUTHENTICATION & MANAGEMENT TABLES
      // ============================================================================
      
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        first_name TEXT,
        last_name TEXT,
        avatar_url TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // OAuth providers table
      `CREATE TABLE IF NOT EXISTS oauth_providers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        provider TEXT NOT NULL CHECK (provider IN ('google', 'github', 'linkedin', 'facebook')),
        provider_id TEXT NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(provider, provider_id)
      )`,

      // User sessions table
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // User preferences table
      `CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT PRIMARY KEY,
        theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
        notifications BOOLEAN DEFAULT TRUE,
        public_profile BOOLEAN DEFAULT FALSE,
        default_project_visibility TEXT DEFAULT 'private' CHECK (default_project_visibility IN ('private', 'public', 'unlisted')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // ============================================================================
      // ENHANCED SYSTEM DESIGNS TABLE (WITH USER OWNERSHIP)
      // ============================================================================
      
      // System designs table (updated with user ownership and visibility)
      `CREATE TABLE IF NOT EXISTS systems (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        version TEXT DEFAULT '1.0.0',
        user_id TEXT,
        visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'unlisted')),
        fork_count INTEGER DEFAULT 0,
        star_count INTEGER DEFAULT 0,
        original_system_id TEXT,
        mode TEXT NOT NULL CHECK (mode IN ('light', 'heavy', 'deployment')),
        components TEXT NOT NULL DEFAULT '[]',
        connections TEXT NOT NULL DEFAULT '[]',
        patterns TEXT NOT NULL DEFAULT '[]',
        tags TEXT NOT NULL DEFAULT '[]',
        author TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
        FOREIGN KEY (original_system_id) REFERENCES systems (id) ON DELETE SET NULL
      )`,

      // ============================================================================
      // PROJECT MANAGEMENT TABLES
      // ============================================================================
      
      // Project metadata table
      `CREATE TABLE IF NOT EXISTS project_metadata (
        system_id TEXT PRIMARY KEY,
        readme_content TEXT,
        documentation TEXT,
        changelog TEXT,
        keywords TEXT DEFAULT '[]',
        license TEXT DEFAULT 'MIT',
        repository_url TEXT,
        demo_url TEXT,
        screenshots TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (system_id) REFERENCES systems (id) ON DELETE CASCADE
      )`,

      // Project stars table
      `CREATE TABLE IF NOT EXISTS project_stars (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        system_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (system_id) REFERENCES systems (id) ON DELETE CASCADE,
        UNIQUE(user_id, system_id)
      )`,

      // Project collaborators table
      `CREATE TABLE IF NOT EXISTS project_collaborators (
        id TEXT PRIMARY KEY,
        system_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT DEFAULT 'collaborator' CHECK (role IN ('owner', 'admin', 'collaborator', 'viewer')),
        permissions TEXT DEFAULT '{}',
        invited_by TEXT,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (system_id) REFERENCES systems (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (invited_by) REFERENCES users (id),
        UNIQUE(system_id, user_id)
      )`,

      // User activity log
      `CREATE TABLE IF NOT EXISTS user_activities (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        activity_type TEXT NOT NULL CHECK (activity_type IN ('create', 'update', 'simulate', 'deploy', 'fork', 'star', 'delete')),
        resource_type TEXT NOT NULL CHECK (resource_type IN ('system', 'pattern', 'simulation', 'deployment', 'service', 'ml_model')),
        resource_id TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // ============================================================================
      // EXISTING TABLES (UPDATED WITH USER CONTEXT)
      // ============================================================================

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

      // Service builders table (updated with user context)
      `CREATE TABLE IF NOT EXISTS service_builders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        framework TEXT NOT NULL,
        user_id TEXT,
        endpoints TEXT NOT NULL DEFAULT '[]',
        database_config TEXT,
        generated_code TEXT,
        docker_config TEXT,
        kubernetes_config TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )`,

      // ML model builders table (updated with user context)
      `CREATE TABLE IF NOT EXISTS ml_models (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        task_type TEXT NOT NULL,
        framework TEXT NOT NULL,
        user_id TEXT,
        architecture TEXT NOT NULL DEFAULT '{}',
        training TEXT NOT NULL DEFAULT '{}',
        serving TEXT,
        generated_code TEXT,
        training_script TEXT,
        serving_script TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )`,

      // Simulations table (updated with user context)
      `CREATE TABLE IF NOT EXISTS simulations (
        id TEXT PRIMARY KEY,
        system_id TEXT NOT NULL,
        user_id TEXT,
        duration INTEGER DEFAULT 60,
        users INTEGER DEFAULT 100,
        requests_per_second INTEGER DEFAULT 10,
        traffic_pattern TEXT DEFAULT 'constant',
        failure_scenarios TEXT NOT NULL DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (system_id) REFERENCES systems (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
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
        FOREIGN KEY (config_id) REFERENCES simulations (id) ON DELETE CASCADE
      )`,

      // Deployments table (updated with user context)
      `CREATE TABLE IF NOT EXISTS deployments (
        id TEXT PRIMARY KEY,
        system_id TEXT NOT NULL,
        user_id TEXT,
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
        FOREIGN KEY (system_id) REFERENCES systems (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )`
    ];

    // Execute table creation
    for (const tableSQL of tables) {
      this.db.exec(tableSQL);
    }

    // Create indexes for better performance
    const indexes = [
      // User authentication indexes
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)',
      'CREATE INDEX IF NOT EXISTS idx_oauth_providers_user_id ON oauth_providers (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_oauth_providers_provider ON oauth_providers (provider, provider_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions (expires_at)',
      
      // Project management indexes
      'CREATE INDEX IF NOT EXISTS idx_systems_user_id ON systems (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_systems_visibility ON systems (visibility)',
      'CREATE INDEX IF NOT EXISTS idx_systems_author ON systems (author)',
      'CREATE INDEX IF NOT EXISTS idx_systems_mode ON systems (mode)',
      'CREATE INDEX IF NOT EXISTS idx_systems_created_at ON systems (created_at)',
      'CREATE INDEX IF NOT EXISTS idx_project_stars_user_id ON project_stars (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_project_stars_system_id ON project_stars (system_id)',
      'CREATE INDEX IF NOT EXISTS idx_project_collaborators_system_id ON project_collaborators (system_id)',
      'CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities (created_at)',
      
      // Existing indexes
      'CREATE INDEX IF NOT EXISTS idx_components_type ON components (type)',
      'CREATE INDEX IF NOT EXISTS idx_patterns_category ON patterns (category)',
      'CREATE INDEX IF NOT EXISTS idx_service_builders_user_id ON service_builders (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_ml_models_user_id ON ml_models (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_simulations_system_id ON simulations (system_id)',
      'CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_simulation_results_config_id ON simulation_results (config_id)',
      'CREATE INDEX IF NOT EXISTS idx_deployments_system_id ON deployments (system_id)',
      'CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments (user_id)',
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
      // Insert example user with hashed password for demo@scalesim.app / demo123
      const insertUser = this.db.prepare(`
        INSERT INTO users (id, email, password_hash, first_name, last_name, email_verified)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const exampleUserId = 'demo-user-' + Date.now();
      // This is bcrypt hash for 'demo123' with salt 10
      const demoPasswordHash = '$2b$10$K8BQC5L7Z9XxJ5s3sH2R2O5vNzJ3F6K8L9M1N2P3Q4R5S6T7U8V9W0';
      
      insertUser.run(
        exampleUserId,
        'demo@scalesim.app',
        demoPasswordHash,
        'Demo',
        'User',
        1  // Use 1 instead of true for SQLite
      );

      // Insert user preferences
      const insertPreferences = this.db.prepare(`
        INSERT INTO user_preferences (user_id)
        VALUES (?)
      `);
      insertPreferences.run(exampleUserId);

      // Insert example system
      const insertSystem = this.db.prepare(`
        INSERT INTO systems (id, name, description, mode, components, connections, patterns, author, user_id, visibility)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const exampleSystemId = 'example-microservices-system';
      insertSystem.run(
        exampleSystemId,
        'E-commerce Microservices',
        'Example e-commerce system with microservices architecture',
        'light',
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify(['api-gateway', 'microservices']),
        'Demo User',
        exampleUserId,
        'public'
      );

      // Insert project metadata
      const insertMetadata = this.db.prepare(`
        INSERT INTO project_metadata (system_id, readme_content, keywords, license)
        VALUES (?, ?, ?, ?)
      `);

      insertMetadata.run(
        exampleSystemId,
        '# E-commerce Microservices\n\nA comprehensive microservices-based e-commerce platform built with ScaleSim.',
        JSON.stringify(['microservices', 'e-commerce', 'scalable', 'cloud-native']),
        'MIT'
      );

      // Insert project collaboration (user as owner)
      const insertCollaborator = this.db.prepare(`
        INSERT INTO project_collaborators (id, system_id, user_id, role)
        VALUES (?, ?, ?, ?)
      `);

      insertCollaborator.run(
        'collab-' + Date.now(),
        exampleSystemId,
        exampleUserId,
        'owner'
      );

      logger.info('Database seeded with example data including user authentication');
    } catch (error) {
      logger.warn('Failed to seed database:', error);
    }
  }

  // Database access methods
  prepare(sql: string) {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.prepare(sql);
  }

  exec(sql: string) {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.exec(sql);
  }

  transaction(fn: () => void) {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.transaction(fn);
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}

// Create singleton instance
const database = new DatabaseManager();

export { database };
export default database; 