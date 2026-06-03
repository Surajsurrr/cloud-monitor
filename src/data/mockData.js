// Mock Cloud Infrastructure Data
// This simulates real monitoring data from cloud providers (AWS, GCP, Azure)

export const MOCK_SERVERS = [
  {
    id: 'server-001',
    name: 'api-server-prod-01',
    region: 'us-east-1',
    type: 'compute-optimized',
    status: 'running',
    uptime: 99.95,
    cpu: {
      cores: 8,
      usage: 24.5,
      throttled: false,
    },
    memory: {
      total: 32,
      used: 18.2,
      available: 13.8,
    },
    disk: {
      total: 500,
      used: 245.3,
      available: 254.7,
    },
    network: {
      inbound: 2456.8,
      outbound: 1832.4,
      packets_lost: 0,
    },
    lastHealthCheck: new Date(Date.now() - 5000).toISOString(),
  },
  {
    id: 'server-002',
    name: 'api-server-prod-02',
    region: 'us-west-2',
    type: 'compute-optimized',
    status: 'running',
    uptime: 99.98,
    cpu: {
      cores: 8,
      usage: 18.7,
      throttled: false,
    },
    memory: {
      total: 32,
      used: 14.9,
      available: 17.1,
    },
    disk: {
      total: 500,
      used: 198.7,
      available: 301.3,
    },
    network: {
      inbound: 2108.3,
      outbound: 1654.2,
      packets_lost: 0,
    },
    lastHealthCheck: new Date(Date.now() - 3000).toISOString(),
  },
  {
    id: 'server-003',
    name: 'database-server-01',
    region: 'eu-west-1',
    type: 'memory-optimized',
    status: 'running',
    uptime: 100.0,
    cpu: {
      cores: 16,
      usage: 35.2,
      throttled: false,
    },
    memory: {
      total: 256,
      used: 198.4,
      available: 57.6,
    },
    disk: {
      total: 2000,
      used: 1456.2,
      available: 543.8,
    },
    network: {
      inbound: 5234.1,
      outbound: 3891.7,
      packets_lost: 0,
    },
    lastHealthCheck: new Date(Date.now() - 1000).toISOString(),
  },
  {
    id: 'server-004',
    name: 'cache-server-01',
    region: 'ap-southeast-1',
    type: 'memory-optimized',
    status: 'running',
    uptime: 99.99,
    cpu: {
      cores: 4,
      usage: 8.3,
      throttled: false,
    },
    memory: {
      total: 128,
      used: 95.2,
      available: 32.8,
    },
    disk: {
      total: 1000,
      used: 234.5,
      available: 765.5,
    },
    network: {
      inbound: 8234.5,
      outbound: 7123.8,
      packets_lost: 0,
    },
    lastHealthCheck: new Date(Date.now() - 2500).toISOString(),
  },
];

export const MOCK_STATUS = {
  timestamp: new Date().toISOString(),
  environment: 'production',
  version: '1.0.0',
  uptime: 999999, // seconds
  services: {
    api: { status: 'operational', latency: 42 },
    database: { status: 'operational', latency: 128 },
    cache: { status: 'operational', latency: 2 },
    monitoring: { status: 'operational', latency: 5 },
  },
  infrastructure: {
    total_servers: 4,
    healthy_servers: 4,
    degraded_servers: 0,
    failed_servers: 0,
    health_percentage: 100,
  },
  metrics: {
    avg_cpu_usage: 21.7,
    avg_memory_usage: 56.7,
    avg_disk_usage: 52.5,
    total_network_in: 18033.7,
    total_network_out: 14502.1,
  },
  alerts: {
    critical: 0,
    warning: 0,
    info: 2,
  },
};

export function generateServerMetrics(server) {
  // Simulate slight variations in metrics
  const variation = (value, variance = 0.1) => {
    const change = (Math.random() - 0.5) * 2 * variance;
    return Math.max(0, Math.min(100, value + change));
  };

  return {
    ...server,
    cpu: {
      ...server.cpu,
      usage: variation(server.cpu.usage, 5),
    },
    memory: {
      ...server.memory,
      used: variation(server.memory.used, 5),
    },
    disk: {
      ...server.disk,
      used: variation(server.disk.used, 2),
    },
  };
}

export function getInfrastructureStatus() {
  const healthyCount = MOCK_SERVERS.filter(s => s.status === 'running').length;
  const totalCount = MOCK_SERVERS.length;

  return {
    ...MOCK_STATUS,
    infrastructure: {
      total_servers: totalCount,
      healthy_servers: healthyCount,
      degraded_servers: 0,
      failed_servers: totalCount - healthyCount,
      health_percentage: (healthyCount / totalCount) * 100,
    },
    timestamp: new Date().toISOString(),
  };
}
