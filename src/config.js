// Configuration and constants for Cloud Monitor API

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: '/api',
  API_VERSION: 'v1',
  
  // Monitoring intervals (in milliseconds)
  HEALTH_CHECK_INTERVAL: 10000, // 10 seconds
  METRICS_UPDATE_INTERVAL: 30000, // 30 seconds
  
  // Default values
  DEFAULT_RESPONSE_TIMEOUT: 5000,
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const RESPONSE_MESSAGES = {
  SUCCESS: 'Request processed successfully',
  ERROR: 'An error occurred while processing your request',
  NOT_FOUND: 'Resource not found',
  INVALID_REQUEST: 'Invalid request parameters',
  SERVER_ERROR: 'Internal server error',
};
