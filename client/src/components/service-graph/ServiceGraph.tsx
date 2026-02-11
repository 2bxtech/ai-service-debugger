import { useIncidentStore } from '../../stores/incidentStore';

export function ServiceGraph() {
  const { serviceGraph } = useIncidentStore();

  if (!serviceGraph) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="mb-4 text-6xl">🔗</div>
        <p className="text-sm">Load a sample incident to view the service graph</p>
        <p className="text-xs text-gray-600 mt-2">Phase 2: Visualization coming soon</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-4">Service Topology</div>
      
      {/* Placeholder: List nodes and edges as text for now */}
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-2">Services</h4>
          <div className="space-y-1">
            {serviceGraph.nodes.map((node) => (
              <div
                key={node.id}
                className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-800"
              >
                <span className="text-sm">{node.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{node.type}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      node.status === 'healthy'
                        ? 'bg-green-500/10 text-green-400'
                        : node.status === 'degraded'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-2">Dependencies</h4>
          <div className="space-y-1">
            {serviceGraph.edges.map((edge, idx) => (
              <div key={idx} className="text-sm text-gray-400 p-2 bg-gray-900/50 rounded">
                {edge.source} → {edge.target}
                {edge.label && (
                  <span className="text-xs text-gray-600 ml-2">({edge.label})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
        <strong>Phase 2:</strong> Interactive graph visualization using React Flow coming soon.
        This will show cascade chains, node status coloring, and interactive exploration.
      </div>
    </div>
  );
}
