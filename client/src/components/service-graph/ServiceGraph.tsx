import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MarkerType,
  Node,
  Position,
  Handle,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import dagre from 'dagre';
import {
  Globe,
  Server,
  Database,
  HardDrive,
  Layers,
  Cloud,
  Play,
  RotateCcw,
  Cpu,
} from 'lucide-react';
import { useIncidentStore } from '../../stores/incidentStore';
import { useFilterStore } from '../../stores/filterStore';
import type {
  ServiceNode as ServiceNodeType,
  ServiceEdge as ServiceEdgeType,
  ServiceStatus,
  ServiceType,
} from '../../types/serviceGraph';
import 'reactflow/dist/style.css';

// ── Status colors ──────────────────────────────────────────────
const STATUS_COLORS: Record<ServiceStatus, { bg: string; border: string; dot: string; text: string }> = {
  healthy: {
    bg: 'bg-green-950/40',
    border: 'border-green-500/60',
    dot: 'bg-green-400',
    text: 'text-green-400',
  },
  degraded: {
    bg: 'bg-yellow-950/40',
    border: 'border-yellow-500/60',
    dot: 'bg-yellow-400',
    text: 'text-yellow-400',
  },
  down: {
    bg: 'bg-red-950/40',
    border: 'border-red-500/60',
    dot: 'bg-red-400',
    text: 'text-red-400',
  },
  unknown: {
    bg: 'bg-gray-900/40',
    border: 'border-gray-600/60',
    dot: 'bg-gray-500',
    text: 'text-gray-400',
  },
};

const STATUS_EDGE_COLORS: Record<ServiceStatus, string> = {
  healthy: '#22c55e',
  degraded: '#eab308',
  down: '#ef4444',
  unknown: '#6b7280',
};

// ── Service type icons ─────────────────────────────────────────
const SERVICE_ICONS: Record<ServiceType, React.ComponentType<any>> = {
  gateway: Globe,
  api: Server,
  database: Database,
  cache: HardDrive,
  queue: Layers,
  external: Cloud,
  worker: Cpu,
};

// ── Dagre layout ───────────────────────────────────────────────
const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, ranksep: 80, nodesep: 60 });

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  const laid = nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      sourcePosition: direction === 'TB' ? Position.Bottom : Position.Right,
      targetPosition: direction === 'TB' ? Position.Top : Position.Left,
    };
  });

  return { nodes: laid, edges };
}

// ── Custom node component ──────────────────────────────────────
interface ServiceNodeData {
  label: string;
  type: ServiceType;
  status: ServiceStatus;
  errorCount: number;
  isActive: boolean; // cascade animation highlight
  serviceId: string;
}

function ServiceNodeComponent({ data }: { data: ServiceNodeData }) {
  const colors = STATUS_COLORS[data.status];
  const Icon = SERVICE_ICONS[data.type] || Server;
  const filterStore = useFilterStore();

  const handleMouseEnter = useCallback(() => {
    // Highlight related logs in timeline when hovering a node
    filterStore.setServiceFilter?.([data.serviceId]);
  }, [data.serviceId, filterStore]);

  const handleMouseLeave = useCallback(() => {
    filterStore.setServiceFilter?.([]);
  }, [filterStore]);

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 transition-all duration-300
        ${colors.bg} ${colors.border}
        ${data.isActive ? 'ring-2 ring-offset-2 ring-offset-gray-950 ring-blue-400 scale-105' : ''}
        ${data.type === 'external' ? 'border-dashed' : ''}
        hover:brightness-125 cursor-pointer
      `}
      style={{ width: NODE_WIDTH }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-600 !w-2 !h-2" />

      <div className="flex items-center gap-2">
        <Icon size={16} className={colors.text} />
        <span className="text-sm font-medium text-gray-100 truncate flex-1">
          {data.label}
        </span>
        <span className={`w-2 h-2 rounded-full ${colors.dot} ${
          data.isActive ? 'animate-pulse' : ''
        }`} />
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-gray-500 capitalize">{data.type}</span>
        {data.errorCount > 0 && (
          <span className="text-xs text-red-400 font-mono">
            {data.errorCount} error{data.errorCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {data.status !== 'healthy' && data.status !== 'unknown' && (
        <div className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
          data.status === 'down'
            ? 'bg-red-500 text-white'
            : 'bg-yellow-500 text-gray-900'
        }`}>
          {data.status}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-600 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { serviceNode: ServiceNodeComponent };

// ── Main graph component ───────────────────────────────────────
function ServiceGraphInner() {
  const { serviceGraph, analysis } = useIncidentStore();
  const { fitView } = useReactFlow();

  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [activeEdges, setActiveEdges] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const timersRef = useRef<number[]>([]);

  // Build cascade chain from analysis
  const cascadeChain: string[] = useMemo(() => {
    if (!analysis?.cascadeChain) return [];
    // cascadeChain is an array of service IDs in order of failure propagation
    return analysis.cascadeChain;
  }, [analysis]);

  // Clear timers on unmount
  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  // Auto-play cascade animation when analysis first arrives
  useEffect(() => {
    if (cascadeChain.length > 0 && !hasAnimated && !isAnimating) {
      const t = setTimeout(() => playCascade(), 600);
      timersRef.current.push(t);
    }
  }, [cascadeChain, hasAnimated]);

  const playCascade = useCallback(() => {
    if (cascadeChain.length === 0 || !serviceGraph) return;

    // Clear previous
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActiveNodes(new Set());
    setActiveEdges(new Set());
    setIsAnimating(true);

    const STEP_MS = 600;

    cascadeChain.forEach((nodeId, i) => {
      const t = setTimeout(() => {
        setActiveNodes((prev) => new Set([...prev, nodeId]));

        // Highlight edge from previous node to this node
        if (i > 0) {
          const prevId = cascadeChain[i - 1];
          const edgeId = `${prevId}-${nodeId}`;
          const edgeIdReverse = `${nodeId}-${prevId}`;
          setActiveEdges((prev) => new Set([...prev, edgeId, edgeIdReverse]));
        }
      }, i * STEP_MS);
      timersRef.current.push(t);
    });

    // End animation
    const endTimer = setTimeout(() => {
      setIsAnimating(false);
      setHasAnimated(true);
    }, cascadeChain.length * STEP_MS + 200);
    timersRef.current.push(endTimer);
  }, [cascadeChain, serviceGraph]);

  const resetAnimation = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActiveNodes(new Set());
    setActiveEdges(new Set());
    setIsAnimating(false);
    setHasAnimated(false);
  }, []);

  // Convert service graph data to React Flow format
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!serviceGraph) return { flowNodes: [], flowEdges: [] };

    const nodes: Node[] = serviceGraph.nodes.map((n: ServiceNodeType) => ({
      id: n.id,
      type: 'serviceNode',
      position: { x: 0, y: 0 }, // dagre will set this
      data: {
        label: n.name,
        type: n.type,
        status: n.status || 'unknown',
        errorCount: n.errorCount || 0,
        isActive: activeNodes.has(n.id),
        serviceId: n.id,
      } satisfies ServiceNodeData,
    }));

    const edges: Edge[] = serviceGraph.edges.map((e: ServiceEdgeType) => {
      const id = `${e.source}-${e.target}`;
      const isHighlighted = activeEdges.has(id);
      const sourceNode = serviceGraph.nodes.find((n: ServiceNodeType) => n.id === e.source);
      const sourceStatus = sourceNode?.status || 'unknown';

      return {
        id,
        source: e.source,
        target: e.target,
        label: e.label || e.protocol,
        animated: isHighlighted,
        style: {
          stroke: isHighlighted ? '#3b82f6' : STATUS_EDGE_COLORS[sourceStatus],
          strokeWidth: isHighlighted ? 3 : 1.5,
          opacity: isHighlighted ? 1 : 0.6,
          transition: 'all 0.3s ease',
        },
        labelStyle: {
          fill: '#9ca3af',
          fontSize: 10,
          fontFamily: 'monospace',
        },
        labelBgStyle: {
          fill: '#111827',
          fillOpacity: 0.8,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlighted ? '#3b82f6' : STATUS_EDGE_COLORS[sourceStatus],
          width: 16,
          height: 16,
        },
      };
    });

    const { nodes: laid, edges: laidEdges } = getLayoutedElements(nodes, edges);
    return { flowNodes: laid, flowEdges: laidEdges };
  }, [serviceGraph, activeNodes, activeEdges]);

  // Fit view when nodes change
  useEffect(() => {
    if (flowNodes.length > 0) {
      const t = setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
      return () => clearTimeout(t);
    }
  }, [flowNodes.length, fitView]);

  if (!serviceGraph || serviceGraph.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
        <Layers size={32} />
        <p className="text-sm">Load a sample incident to view the service graph</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Cascade controls */}
      {cascadeChain.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800 bg-gray-900/50">
          <span className="text-xs text-gray-400 mr-1">Cascade Path:</span>
          {cascadeChain.map((id, i) => (
            <span key={id} className="flex items-center gap-1">
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                activeNodes.has(id)
                  ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40'
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {id}
              </span>
              {i < cascadeChain.length - 1 && (
                <span className="text-gray-600 text-xs">→</span>
              )}
            </span>
          ))}

          <div className="ml-auto flex items-center gap-1">
            {!isAnimating && (
              <button
                onClick={() => { resetAnimation(); setTimeout(playCascade, 100); }}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                {hasAnimated ? <RotateCcw size={12} /> : <Play size={12} />}
                {hasAnimated ? 'Replay' : 'Play'}
              </button>
            )}
            {isAnimating && (
              <span className="text-xs text-blue-400 animate-pulse">Animating...</span>
            )}
          </div>
        </div>
      )}

      {/* Graph */}
      <div className="flex-1">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.3}
          maxZoom={1.5}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
        >
          <Background color="#374151" gap={20} size={1} />
          <Controls
            className="!bg-gray-800 !border-gray-700 !rounded-lg [&>button]:!bg-gray-800 [&>button]:!border-gray-700 [&>button]:!text-gray-400 [&>button:hover]:!bg-gray-700"
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-3 py-2 border-t border-gray-800 bg-gray-900/50">
        {(['healthy', 'degraded', 'down'] as ServiceStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[s].dot}`} />
            <span className="text-xs text-gray-500 capitalize">{s}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-4 border-t border-dashed border-gray-500" />
          <span className="text-xs text-gray-500">External</span>
        </div>
      </div>
    </div>
  );
}

// Wrap in provider — React Flow requires it
export function ServiceGraph() {
  return (
    <ReactFlowProvider>
      <ServiceGraphInner />
    </ReactFlowProvider>
  );
}