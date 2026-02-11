
export interface ServiceNode {
  id: string;
  name: string;
  type: 'api' | 'worker' | 'database' | 'cache' | 'queue' | 'gateway' | 'external';
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
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
