// API Routes
// Cloud Infrastructure Monitoring Endpoints

import express from 'express';
import { HTTP_STATUS, RESPONSE_MESSAGES, CONFIG } from '../config.js';
import { MOCK_SERVERS, getInfrastructureStatus, generateServerMetrics } from '../data/mockData.js';

const router = express.Router();

/**
 * GET /api/v1/health
 * Service health check endpoint
 * Returns basic service status and connectivity information
 */
router.get('/health', (req, res) => {
  const healthStatus = {
    success: true,
    status: HTTP_STATUS.OK,
    message: 'Service is healthy',
    service: {
      name: 'Cloud Monitor API',
      version: '1.0.0',
      environment: CONFIG.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  res.status(HTTP_STATUS.OK).json(healthStatus);
});

/**
 * GET /api/v1/servers
 * Retrieve all monitored servers with current metrics
 * Returns array of server objects with CPU, memory, disk, and network metrics
 */
router.get('/servers', (req, res) => {
  try {
    // Optional query parameter for filtering
    const { region, type, status } = req.query;

    let servers = MOCK_SERVERS.map(server => generateServerMetrics(server));

    // Apply filters if provided
    if (region) {
      servers = servers.filter(s => s.region === region);
    }
    if (type) {
      servers = servers.filter(s => s.type === type);
    }
    if (status) {
      servers = servers.filter(s => s.status === status);
    }

    const response = {
      success: true,
      status: HTTP_STATUS.OK,
      message: RESPONSE_MESSAGES.SUCCESS,
      data: {
        count: servers.length,
        servers,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: RESPONSE_MESSAGES.SERVER_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/v1/servers/:id
 * Retrieve a specific server by ID
 * Returns detailed metrics for a single server
 */
router.get('/servers/:id', (req, res) => {
  try {
    const { id } = req.params;

    const server = MOCK_SERVERS.find(s => s.id === id);

    if (!server) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        status: HTTP_STATUS.NOT_FOUND,
        message: `Server with ID '${id}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    const response = {
      success: true,
      status: HTTP_STATUS.OK,
      message: RESPONSE_MESSAGES.SUCCESS,
      data: generateServerMetrics(server),
      timestamp: new Date().toISOString(),
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    console.error('Error fetching server:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: RESPONSE_MESSAGES.SERVER_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/v1/status
 * Infrastructure status overview
 * Returns aggregated statistics, health metrics, and service status
 */
router.get('/status', (req, res) => {
  try {
    const infrastructureStatus = getInfrastructureStatus();

    const response = {
      success: true,
      status: HTTP_STATUS.OK,
      message: RESPONSE_MESSAGES.SUCCESS,
      data: infrastructureStatus,
      timestamp: new Date().toISOString(),
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    console.error('Error fetching infrastructure status:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: RESPONSE_MESSAGES.SERVER_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/v1/metrics
 * Detailed metrics summary
 * Returns aggregated CPU, memory, disk, and network metrics across all servers
 */
router.get('/metrics', (req, res) => {
  try {
    const servers = MOCK_SERVERS.map(server => generateServerMetrics(server));

    const metrics = {
      cpu: {
        avg: (servers.reduce((sum, s) => sum + s.cpu.usage, 0) / servers.length).toFixed(2),
        max: Math.max(...servers.map(s => s.cpu.usage)).toFixed(2),
        min: Math.min(...servers.map(s => s.cpu.usage)).toFixed(2),
      },
      memory: {
        avg: (servers.reduce((sum, s) => sum + (s.memory.used / s.memory.total * 100), 0) / servers.length).toFixed(2),
        total_used: servers.reduce((sum, s) => sum + s.memory.used, 0).toFixed(2),
        total_available: servers.reduce((sum, s) => sum + s.memory.available, 0).toFixed(2),
      },
      disk: {
        avg: (servers.reduce((sum, s) => sum + (s.disk.used / s.disk.total * 100), 0) / servers.length).toFixed(2),
        total_used: servers.reduce((sum, s) => sum + s.disk.used, 0).toFixed(2),
        total_available: servers.reduce((sum, s) => sum + s.disk.available, 0).toFixed(2),
      },
      network: {
        total_inbound: servers.reduce((sum, s) => sum + s.network.inbound, 0).toFixed(2),
        total_outbound: servers.reduce((sum, s) => sum + s.network.outbound, 0).toFixed(2),
      },
    };

    const response = {
      success: true,
      status: HTTP_STATUS.OK,
      message: RESPONSE_MESSAGES.SUCCESS,
      data: metrics,
      timestamp: new Date().toISOString(),
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: RESPONSE_MESSAGES.SERVER_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
