
export interface IncidentScenario {
  id: string;
  name: string;
  description: string;
  category: 'cascade' | 'config' | 'resource' | 'network' | 'deployment';
  logs: string;              // Raw log text
  serviceGraph: ServiceGraph;
  expectedRootCause: string; // For validation / README
}