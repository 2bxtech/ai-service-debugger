
export type ServiceType = 'api' | 'worker' | 'database' | 'cache' | 'queue' | 'gateway' | 'external';
export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface ServiceNode {
  id: string;
  name: string;
  type: ServiceType;
  status: ServiceStatus;
  errorCount: number;
}

export interface ServiceEdge {
  source: string;           // ServiceNode.id
  target: string;
  protocol: 'http' | 'grpc' | 'kafka' | 'sql' | 'redis';
  label?: string;
}

export interface ServiceGraph {
  nodes: ServiceNode[];
  edges: ServiceEdge[];
}
