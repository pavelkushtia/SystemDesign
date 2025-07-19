import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { validateEnvVars } from '@scalesim/shared';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { database } from './database/index';
import { CollaborationService } from './services/collaboration';

// Import route handlers
import authRoutes from './routes/auth';
import systemRoutes from './routes/systems';
import componentRoutes from './routes/components';
import patternRoutes from './routes/patterns';
import builderRoutes from './routes/builders';
import simulationRoutes from './routes/simulation';
import deploymentRoutes from './routes/deployment';
import monitoringRoutes, { setMonitoringService } from './routes/monitoring';
import { MonitoringService } from './services/monitoring';
// import aiRoutes from './routes/ai';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['PORT', 'NODE_ENV'];
validateEnvVars(requiredEnvVars);

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? ['https://scalesim.app', 'https://app.scalesim.io']
    : true, // Allow all origins in development
  credentials: true
}));

// Compression and parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 5000, // More generous limit in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Request logging
app.use(requestLogger);

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/systems', systemRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/builders', builderRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/deployment', deploymentRoutes);
app.use('/api/monitoring', monitoringRoutes);
// app.use('/api/ai', aiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

async function initializeDatabase() {
  try {
    await database.initialize();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// ============================================================================
// WEBSOCKET SERVER
// ============================================================================

function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server });
  
  // Initialize collaboration service
  const collaborationService = new CollaborationService(wss);
  
  wss.on('connection', (ws, req) => {
    logger.info(`WebSocket connection established from ${req.socket.remoteAddress}`);
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            break;
          case 'subscribe_simulation':
            // Subscribe to simulation updates
            ws.send(JSON.stringify({ 
              type: 'subscription_confirmed', 
              topic: 'simulation',
              simulationId: data.simulationId 
            }));
            break;
          // Collaboration messages are handled by CollaborationService
          case 'user_join':
          case 'user_leave':
          case 'system_update':
          case 'cursor_move':
          case 'component_select':
          case 'chat_message':
            // These are handled by the CollaborationService
            break;
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON message' }));
      }
    });
    
    ws.on('close', () => {
      logger.info('WebSocket connection closed');
    });
    
    ws.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });
    
    // Send welcome message
    ws.send(JSON.stringify({ 
      type: 'welcome', 
      message: 'Connected to ScaleSim WebSocket server',
      timestamp: new Date().toISOString()
    }));
  });
  
  logger.info('WebSocket server initialized with collaboration support');
  return { wss, collaborationService };
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Create HTTP server
    const server = createServer(app);
    
    // Setup WebSocket server
    const { wss, collaborationService } = setupWebSocket(server);
    
    // Initialize monitoring service with WebSocket
    const monitoringService = new MonitoringService(wss);
    setMonitoringService(monitoringService);
    
    // Start listening
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 ScaleSim Backend Server started`);
      logger.info(`📍 Environment: ${NODE_ENV}`);
      logger.info(`🌐 Server: http://0.0.0.0:${PORT}`);
      logger.info(`📊 Health: http://0.0.0.0:${PORT}/health`);
      logger.info(`🔌 WebSocket: ws://0.0.0.0:${PORT}`);
      logger.info(`📚 API Docs: http://0.0.0.0:${PORT}/api/docs`);
      logger.info(`📈 Monitoring: Real-time metrics and alerts enabled`);
    });
    
    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Close WebSocket server
        wss.close(() => {
          logger.info('WebSocket server closed');
        });
        
        // Close database connection
        try {
          await database.close();
          logger.info('Database connection closed');
        } catch (error) {
          logger.error('Error closing database:', error);
        }
        
        logger.info('Graceful shutdown complete');
        process.exit(0);
      });
    };
    
    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  logger.error('Unhandled error during startup:', error);
  process.exit(1);
});

export default app; 