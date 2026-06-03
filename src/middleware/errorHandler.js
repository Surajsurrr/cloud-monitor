// Error Handling Middleware
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../config.js';

/**
 * Error handler middleware
 * Catches and formats all errors with appropriate HTTP status codes
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  });

  const status = err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || RESPONSE_MESSAGES.SERVER_ERROR;

  res.status(status).json({
    success: false,
    status,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 Not Found middleware
 * Catches all unmatched routes
 */
export function notFoundHandler(req, res) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    status: HTTP_STATUS.NOT_FOUND,
    message: RESPONSE_MESSAGES.NOT_FOUND,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Request logging middleware
 * Logs incoming requests for debugging and monitoring
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  });

  next();
}

/**
 * Health check validation middleware
 * Ensures service is ready to handle requests
 */
export function healthCheckMiddleware(req, res, next) {
  // Add any health check logic here
  next();
}
