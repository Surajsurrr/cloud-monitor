// Cloud Monitor API Server
// Main entry point for the Express application

import express from 'express';
import dotenv from 'dotenv';
import { CONFIG } from './config.js';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  healthCheckMiddleware,
} from './middleware/errorHandler.js';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = CONFIG.PORT;
const NODE_ENV = CONFIG.NODE_ENV;

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Request logging
app.use(requestLogger);

// Health check validation
app.use(healthCheckMiddleware);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers (optional - enable if needed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Cloud Monitor API',
    version: '1.0.0',
    documentation: 'See /api/v1/health for health check',
    endpoints: {
      health: 'GET /api/v1/health',
      servers: 'GET /api/v1/servers',
      'server-detail': 'GET /api/v1/servers/:id',
      status: 'GET /api/v1/status',
      metrics: 'GET /api/v1/metrics',
    },
  });
});

// API Routes
app.use(`${CONFIG.API_PREFIX}/${CONFIG.API_VERSION}`, apiRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

let server;

/**
 * Start the HTTP server
 */
function startServer() {
  server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║           Cloud Monitor API Server Started                        ║
╠═══════════════════════════════════════════════════════════════════╣
║ Server:      ${`http://localhost:${PORT}`.padEnd(50)} ║
║ Environment: ${NODE_ENV.padEnd(50)} ║
║ Process ID:  ${process.pid.toString().padEnd(50)} ║
║ Node.js:     ${process.version.padEnd(50)} ║
║                                                                   ║
║ Documentation:                                                    ║
║   GET  http://localhost:${PORT}/api/v1/health                  ║
║   GET  http://localhost:${PORT}/api/v1/servers                 ║
║   GET  http://localhost:${PORT}/api/v1/status                  ║
║   GET  http://localhost:${PORT}/api/v1/metrics                 ║
║                                                                   ║
║ Press Ctrl+C to stop the server                                  ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
  });
}

/**
 * Graceful shutdown handler
 */
function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// ============================================================================
// PROCESS HANDLERS
// ============================================================================

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// ============================================================================
// START SERVER
// ============================================================================

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Export app for testing
export default app;
