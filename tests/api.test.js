// API Tests using Jest and Supertest
// Comprehensive test suite for Cloud Monitor API endpoints

import request from 'supertest';
import app from '../src/server.js';

describe('Cloud Monitor API', () => {
  
  // =========================================================================
  // ROOT ENDPOINT
  // =========================================================================
  
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  // =========================================================================
  // HEALTH ENDPOINT
  // =========================================================================

  describe('GET /api/v1/health', () => {
    it('should return 200 with healthy status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should contain service information', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.body.service).toHaveProperty('name');
      expect(response.body.service).toHaveProperty('version');
      expect(response.body.service).toHaveProperty('environment');
    });

    it('should include memory usage metrics', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.body).toHaveProperty('memory');
      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('heapTotal');
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app).get('/api/v1/health');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // SERVERS ENDPOINT - LIST
  // =========================================================================

  describe('GET /api/v1/servers', () => {
    it('should return 200 with array of servers', async () => {
      const response = await request(app)
        .get('/api/v1/servers')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body.data).toHaveProperty('servers');
      expect(Array.isArray(response.body.data.servers)).toBe(true);
    });

    it('should return servers with all required properties', async () => {
      const response = await request(app).get('/api/v1/servers');

      const servers = response.body.data.servers;
      expect(servers.length).toBeGreaterThan(0);

      servers.forEach(server => {
        expect(server).toHaveProperty('id');
        expect(server).toHaveProperty('name');
        expect(server).toHaveProperty('region');
        expect(server).toHaveProperty('type');
        expect(server).toHaveProperty('status');
        expect(server).toHaveProperty('cpu');
        expect(server).toHaveProperty('memory');
        expect(server).toHaveProperty('disk');
        expect(server).toHaveProperty('network');
      });
    });

    it('should return servers with valid metrics', async () => {
      const response = await request(app).get('/api/v1/servers');

      const servers = response.body.data.servers;
      servers.forEach(server => {
        // CPU metrics
        expect(server.cpu).toHaveProperty('cores');
        expect(server.cpu).toHaveProperty('usage');
        expect(server.cpu.usage).toBeGreaterThanOrEqual(0);
        expect(server.cpu.usage).toBeLessThanOrEqual(100);

        // Memory metrics
        expect(server.memory).toHaveProperty('total');
        expect(server.memory).toHaveProperty('used');
        expect(server.memory).toHaveProperty('available');

        // Disk metrics
        expect(server.disk).toHaveProperty('total');
        expect(server.disk).toHaveProperty('used');
        expect(server.disk).toHaveProperty('available');

        // Network metrics
        expect(server.network).toHaveProperty('inbound');
        expect(server.network).toHaveProperty('outbound');
        expect(server.network).toHaveProperty('packets_lost');
      });
    });

    it('should filter servers by region query parameter', async () => {
      const response = await request(app)
        .get('/api/v1/servers')
        .query({ region: 'us-east-1' });

      expect(response.status).toBe(200);
      const servers = response.body.data.servers;
      
      if (servers.length > 0) {
        servers.forEach(server => {
          expect(server.region).toBe('us-east-1');
        });
      }
    });

    it('should filter servers by type query parameter', async () => {
      const response = await request(app)
        .get('/api/v1/servers')
        .query({ type: 'compute-optimized' });

      expect(response.status).toBe(200);
      const servers = response.body.data.servers;
      
      if (servers.length > 0) {
        servers.forEach(server => {
          expect(server.type).toBe('compute-optimized');
        });
      }
    });

    it('should filter servers by status query parameter', async () => {
      const response = await request(app)
        .get('/api/v1/servers')
        .query({ status: 'running' });

      expect(response.status).toBe(200);
      const servers = response.body.data.servers;
      
      if (servers.length > 0) {
        servers.forEach(server => {
          expect(server.status).toBe('running');
        });
      }
    });
  });

  // =========================================================================
  // SERVERS ENDPOINT - DETAIL
  // =========================================================================

  describe('GET /api/v1/servers/:id', () => {
    it('should return 200 with specific server details', async () => {
      const response = await request(app)
        .get('/api/v1/servers/server-001')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 'server-001');
    });

    it('should return server with all metrics', async () => {
      const response = await request(app).get('/api/v1/servers/server-001');

      const server = response.body.data;
      expect(server).toHaveProperty('cpu');
      expect(server).toHaveProperty('memory');
      expect(server).toHaveProperty('disk');
      expect(server).toHaveProperty('network');
    });

    it('should return 404 for non-existent server', async () => {
      const response = await request(app)
        .get('/api/v1/servers/invalid-server-id')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('status', 404);
      expect(response.body).toHaveProperty('message');
    });

    it('should accept multiple valid server IDs', async () => {
      const serverIds = ['server-001', 'server-002', 'server-003', 'server-004'];

      for (const id of serverIds) {
        const response = await request(app)
          .get(`/api/v1/servers/${id}`)
          .expect(200);

        expect(response.body.data).toHaveProperty('id', id);
      }
    });
  });

  // =========================================================================
  // STATUS ENDPOINT
  // =========================================================================

  describe('GET /api/v1/status', () => {
    it('should return 200 with infrastructure status', async () => {
      const response = await request(app)
        .get('/api/v1/status')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return environment and service information', async () => {
      const response = await request(app).get('/api/v1/status');

      const data = response.body.data;
      expect(data).toHaveProperty('environment');
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('services');
    });

    it('should return infrastructure metrics', async () => {
      const response = await request(app).get('/api/v1/status');

      const infrastructure = response.body.data.infrastructure;
      expect(infrastructure).toHaveProperty('total_servers');
      expect(infrastructure).toHaveProperty('healthy_servers');
      expect(infrastructure).toHaveProperty('degraded_servers');
      expect(infrastructure).toHaveProperty('failed_servers');
      expect(infrastructure).toHaveProperty('health_percentage');

      expect(infrastructure.total_servers).toBeGreaterThan(0);
      expect(infrastructure.health_percentage).toBeGreaterThanOrEqual(0);
      expect(infrastructure.health_percentage).toBeLessThanOrEqual(100);
    });

    it('should return services status', async () => {
      const response = await request(app).get('/api/v1/status');

      const services = response.body.data.services;
      expect(services).toHaveProperty('api');
      expect(services).toHaveProperty('database');
      expect(services).toHaveProperty('cache');

      Object.values(services).forEach(service => {
        expect(service).toHaveProperty('status');
        expect(service).toHaveProperty('latency');
      });
    });

    it('should return current metrics', async () => {
      const response = await request(app).get('/api/v1/status');

      const metrics = response.body.data.metrics;
      expect(metrics).toHaveProperty('avg_cpu_usage');
      expect(metrics).toHaveProperty('avg_memory_usage');
      expect(metrics).toHaveProperty('avg_disk_usage');
      expect(metrics).toHaveProperty('total_network_in');
      expect(metrics).toHaveProperty('total_network_out');
    });

    it('should have valid timestamp', async () => {
      const response = await request(app).get('/api/v1/status');

      const timestamp = new Date(response.body.data.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // METRICS ENDPOINT
  // =========================================================================

  describe('GET /api/v1/metrics', () => {
    it('should return 200 with aggregated metrics', async () => {
      const response = await request(app)
        .get('/api/v1/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return CPU metrics', async () => {
      const response = await request(app).get('/api/v1/metrics');

      const cpu = response.body.data.cpu;
      expect(cpu).toHaveProperty('avg');
      expect(cpu).toHaveProperty('max');
      expect(cpu).toHaveProperty('min');
    });

    it('should return memory metrics', async () => {
      const response = await request(app).get('/api/v1/metrics');

      const memory = response.body.data.memory;
      expect(memory).toHaveProperty('avg');
      expect(memory).toHaveProperty('total_used');
      expect(memory).toHaveProperty('total_available');
    });

    it('should return disk metrics', async () => {
      const response = await request(app).get('/api/v1/metrics');

      const disk = response.body.data.disk;
      expect(disk).toHaveProperty('avg');
      expect(disk).toHaveProperty('total_used');
      expect(disk).toHaveProperty('total_available');
    });

    it('should return network metrics', async () => {
      const response = await request(app).get('/api/v1/metrics');

      const network = response.body.data.network;
      expect(network).toHaveProperty('total_inbound');
      expect(network).toHaveProperty('total_outbound');
    });
  });

  // =========================================================================
  // ERROR HANDLING
  // =========================================================================

  describe('Error Handling', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/api/v1/undefined-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('status', 404);
    });

    it('should return 404 for typo in endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/helth') // typo: helth instead of health
        .expect(404);

      expect(response.status).toBe(404);
    });
  });

  // =========================================================================
  // RESPONSE FORMAT
  // =========================================================================

  describe('Response Format', () => {
    it('should include success flag in all responses', async () => {
      const endpoints = ['/api/v1/health', '/api/v1/servers', '/api/v1/status'];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.body).toHaveProperty('success');
        expect(typeof response.body.success).toBe('boolean');
      }
    });

    it('should include status code in response body', async () => {
      const response = await request(app).get('/api/v1/health');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe(response.status);
    });

    it('should include message in all responses', async () => {
      const endpoints = ['/api/v1/health', '/api/v1/servers', '/api/v1/status'];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.body).toHaveProperty('message');
      }
    });

    it('should include timestamp in all responses', async () => {
      const endpoints = ['/api/v1/health', '/api/v1/servers', '/api/v1/status'];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.body).toHaveProperty('timestamp');
      }
    });
  });
});
