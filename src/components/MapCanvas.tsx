import React, { useState, useRef } from 'react';
import { Graph } from '../utils/Graph';
import type { ToolMode, ExecutionStep, TerrainFeature } from '../types/graph';
import { 
  Car, 
  MapPin
} from 'lucide-react';

interface MapCanvasProps {
  graph: Graph;
  terrains?: TerrainFeature[];
  sourceNodeId: string;
  targetNodeId: string;
  activeTool: ToolMode | 'inspect';
  currentStep: ExecutionStep | null;
  finalPath: string[];
  finalPathEdges: string[];
  onSelectNode: (nodeId: string) => void;
  onCanvasClick: (x: number, y: number) => void;
  onEdgeClick: (edgeId: string) => void;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeDelete: (nodeId: string) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  graph,
  terrains = [],
  sourceNodeId,
  targetNodeId,
  activeTool,
  currentStep,
  finalPath,
  finalPathEdges,
  onSelectNode,
  onCanvasClick,
  onEdgeClick,
  onNodeMove,
  onNodeDelete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const openSet = new Set(currentStep?.openSet || []);
  const closedSet = new Set(currentStep?.closedSet || []);
  const currentNodeId = currentStep?.currentNodeId || null;
  const activeEdgeId = currentStep?.activeEdgeId || null;
  const finalPathSet = new Set(finalPath);
  const finalPathEdgeSet = new Set(finalPathEdges);

  // Stable Node Mouse Interaction (No Glitching)
  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (activeTool === 'delete') {
      onNodeDelete(nodeId);
      return;
    }

    if (activeTool === 'select_source' || activeTool === 'select_target' || activeTool === 'inspect') {
      onSelectNode(nodeId);
    }

    if (activeTool === 'inspect') {
      const node = graph.nodes.get(nodeId);
      if (node && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDraggingNodeId(nodeId);
        setDragOffset({
          x: e.clientX - rect.left - node.x,
          y: e.clientY - rect.top - node.y,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(40, Math.min(rect.width - 40, e.clientX - rect.left - dragOffset.x));
      const y = Math.max(40, Math.min(rect.height - 40, e.clientY - rect.top - dragOffset.y));
      onNodeMove(draggingNodeId, Math.round(x), Math.round(y));
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (containerRef.current && activeTool === 'add_node') {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      onCanvasClick(x, y);
    }
  };

  const nodeList = Array.from(graph.nodes.values());
  const edgeList = Array.from(graph.edges.values());

  const hoveredNode = hoveredNodeId ? graph.nodes.get(hoveredNodeId) || null : null;
  const hoveredEdge = hoveredEdgeId ? graph.edges.get(hoveredEdgeId) || null : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-[560px] lg:h-[640px] bg-slate-950 rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden select-none bg-dot-pattern"
    >
      <svg
        className="w-full h-full cursor-crosshair"
        onClick={handleSVGClick}
      >
        <defs>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. TERRAIN OVERLAYS (Natural Rivers, Parks, Bays) */}
        {terrains.map((terrain) => (
          <g key={terrain.id} className="pointer-events-none">
            <path
              d={terrain.pathD}
              fill={terrain.fill}
              stroke={terrain.stroke || 'none'}
              strokeWidth="1.5"
            />
            {terrain.label && terrain.labelX && terrain.labelY && (
              <text
                x={terrain.labelX}
                y={terrain.labelY}
                fill={terrain.type === 'park' ? '#6ee7b7' : '#67e8f9'}
                fontSize="11"
                fontWeight="600"
                opacity="0.8"
                textAnchor="middle"
                className="font-sans"
              >
                {terrain.label}
              </text>
            )}
          </g>
        ))}

        {/* 2. EDGES / CURVED ROADS */}
        {edgeList.map((edge) => {
          const uNode = graph.nodes.get(edge.u);
          const vNode = graph.nodes.get(edge.v);
          if (!uNode || !vNode) return null;

          const isFinalPathEdge = finalPathEdgeSet.has(edge.id);
          const isActiveEdge = activeEdgeId === edge.id;
          const weight = graph.getEdgeWeight(edge.id);
          const isBlocked = edge.isBlocked;
          const isTraffic = edge.traffic > 1.0;
          const isHazard = edge.hazard > 1.0;

          // Compute midpoint for curved or straight edge
          let midX = (uNode.x + vNode.x) / 2;
          let midY = (uNode.y + vNode.y) / 2;
          let pathD = `M ${uNode.x} ${uNode.y} L ${vNode.x} ${vNode.y}`;

          if (edge.controlPoint) {
            midX = 0.25 * uNode.x + 0.5 * edge.controlPoint.x + 0.25 * vNode.x;
            midY = 0.25 * uNode.y + 0.5 * edge.controlPoint.y + 0.25 * vNode.y;
            pathD = `M ${uNode.x} ${uNode.y} Q ${edge.controlPoint.x} ${edge.controlPoint.y} ${vNode.x} ${vNode.y}`;
          }

          let strokeColor = '#334155';
          let strokeWidth = 3;
          let strokeDasharray = 'none';

          if (isBlocked) {
            strokeColor = '#64748b';
            strokeDasharray = '6 6';
            strokeWidth = 2.5;
          } else if (isFinalPathEdge) {
            strokeColor = '#10b981';
            strokeWidth = 6;
          } else if (isActiveEdge) {
            strokeColor = '#06b6d4';
            strokeWidth = 5;
          } else if (isHazard) {
            strokeColor = edge.hazard > 2.0 ? '#ef4444' : '#f43f5e';
            strokeDasharray = '8 4';
            strokeWidth = 4;
          } else if (isTraffic) {
            strokeColor = edge.traffic > 2.0 ? '#f59e0b' : '#fbbf24';
            strokeDasharray = '8 4';
            strokeWidth = 4;
          }

          return (
            <g key={edge.id} className="group cursor-pointer">
              {/* Thick hit area line */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth={18}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdgeClick(edge.id);
                }}
                onMouseEnter={() => setHoveredEdgeId(edge.id)}
                onMouseLeave={() => setHoveredEdgeId(null)}
              />

              {/* Main Road Line */}
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                filter={isFinalPathEdge ? 'url(#glow-green)' : isActiveEdge ? 'url(#glow-cyan)' : undefined}
                className="transition-colors duration-200"
              />

              {/* Midpoint Cost Badge */}
              <g
                transform={`translate(${midX}, ${midY})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdgeClick(edge.id);
                }}
                onMouseEnter={() => setHoveredEdgeId(edge.id)}
                onMouseLeave={() => setHoveredEdgeId(null)}
                className="cursor-pointer"
              >
                <rect
                  x="-18"
                  y="-11"
                  width="36"
                  height="22"
                  rx="6"
                  fill={
                    isBlocked
                      ? '#7f1d1d'
                      : isHazard
                      ? '#881337'
                      : isTraffic
                      ? '#78350f'
                      : isFinalPathEdge
                      ? '#064e3b'
                      : '#0f172a'
                  }
                  stroke={
                    isBlocked
                      ? '#ef4444'
                      : isHazard
                      ? '#f43f5e'
                      : isTraffic
                      ? '#f59e0b'
                      : isFinalPathEdge
                      ? '#10b981'
                      : '#334155'
                  }
                  strokeWidth="1.5"
                />

                {isBlocked ? (
                  <text x="0" y="3" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="bold">
                    ⛔
                  </text>
                ) : (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={isFinalPathEdge ? '#34d399' : '#e2e8f0'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {weight === Infinity ? '∞' : Math.round(weight)}
                  </text>
                )}
              </g>
            </g>
          );
        })}

        {/* 3. NODES / INTERSECTIONS (Glitch-Free Mouse Handling) */}
        {nodeList.map((node) => {
          const isSource = node.id === sourceNodeId;
          const isTarget = node.id === targetNodeId;
          const isCurrent = node.id === currentNodeId;
          const isOpen = openSet.has(node.id);
          const isClosed = closedSet.has(node.id);
          const isPath = finalPathSet.has(node.id);
          const isHovered = hoveredNodeId === node.id;

          let ringColor = '#334155';
          let nodeRadius = 16;
          let fillColor = '#1e293b';

          if (isSource) {
            ringColor = '#ef4444';
            fillColor = '#7f1d1d';
            nodeRadius = 20;
          } else if (isTarget) {
            ringColor = '#10b981';
            fillColor = '#064e3b';
            nodeRadius = 20;
          } else if (isCurrent) {
            ringColor = '#ffffff';
            fillColor = '#0284c7';
            nodeRadius = 22;
          } else if (isPath) {
            ringColor = '#10b981';
            fillColor = '#065f46';
            nodeRadius = 18;
          } else if (isOpen) {
            ringColor = '#f59e0b';
            fillColor = '#78350f';
            nodeRadius = 18;
          } else if (isClosed) {
            ringColor = '#06b6d4';
            fillColor = '#0e7490';
            nodeRadius = 15;
          }

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-pointer"
            >
              {/* Steady Invisible Mouse Hitbox */}
              <circle
                r={26}
                fill="transparent"
                pointerEvents="all"
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              />

              {/* Hover highlight ring (Non-glitching overlay) */}
              <circle
                r={nodeRadius + 6}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                opacity={isHovered ? 0.9 : 0}
                className="transition-opacity duration-150"
              />

              {/* Pulsing state ring */}
              {(isSource || isTarget || isCurrent || isOpen || isPath) && (
                <circle
                  r={nodeRadius + 7}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="2"
                  opacity="0.6"
                  className={isCurrent ? 'animate-ping' : isOpen ? 'animate-pulse' : ''}
                />
              )}

              {/* Node Circle Body */}
              <circle
                r={nodeRadius}
                fill={fillColor}
                stroke={ringColor}
                strokeWidth={isSource || isTarget || isCurrent ? 3 : 2}
                filter={isSource || isTarget ? 'url(#glow-green)' : isCurrent ? 'url(#glow-cyan)' : undefined}
                className="pointer-events-none shadow-lg"
              />

              {/* Node Icon */}
              {isSource ? (
                <text x="0" y="5" textAnchor="middle" fontSize="16" className="pointer-events-none">
                  🚑
                </text>
              ) : isTarget ? (
                <text x="0" y="5" textAnchor="middle" fontSize="16" className="pointer-events-none">
                  🏥
                </text>
              ) : node.type === 'station' ? (
                <text x="0" y="5" textAnchor="middle" fontSize="13" className="pointer-events-none">
                  🚒
                </text>
              ) : node.type === 'helipad' ? (
                <text x="0" y="5" textAnchor="middle" fontSize="13" className="pointer-events-none">
                  🚁
                </text>
              ) : node.type === 'residential' ? (
                <text x="0" y="4" textAnchor="middle" fontSize="12" className="pointer-events-none">
                  🏠
                </text>
              ) : (
                <circle r={4} fill={isPath ? '#34d399' : '#cbd5e1'} className="pointer-events-none" />
              )}

              {/* Node Label Text */}
              <text
                x="0"
                y={nodeRadius + 15}
                textAnchor="middle"
                fill={isSource ? '#fca5a5' : isTarget ? '#6ee7b7' : isPath ? '#a7f3d0' : '#94a3b8'}
                fontSize="11"
                fontWeight={isSource || isTarget || isPath ? 'bold' : '500'}
                className="pointer-events-none drop-shadow"
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 4. PINNED GLASS HOVER HUD (Top Left) */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 glass-panel p-3.5 rounded-2xl border border-cyan-500/30 text-xs shadow-2xl pointer-events-none max-w-xs animate-fadeIn transition-all">
          <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>{hoveredNode.name}</span>
          </div>
          <div className="space-y-1 text-slate-300 font-mono text-[11px]">
            <p>Node ID: <span className="text-slate-100">{hoveredNode.id}</span></p>
            <p>Category: <span className="text-amber-400 uppercase font-semibold">{hoveredNode.type}</span></p>
            <p>Coordinates: <span className="text-slate-100">({hoveredNode.x}, {hoveredNode.y})</span></p>
            {currentStep?.distances[hoveredNode.id] !== undefined && (
              <p className="pt-1 border-t border-slate-800 text-emerald-400 font-bold">
                Dynamic Cost: {' '}
                <span>
                  {currentStep.distances[hoveredNode.id] === Infinity
                    ? '∞ (Unreachable)'
                    : currentStep.distances[hoveredNode.id].toFixed(1)}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {hoveredEdge && !hoveredNode && (
        <div className="absolute top-4 left-4 glass-panel p-3.5 rounded-2xl border border-amber-500/30 text-xs shadow-2xl pointer-events-none max-w-xs animate-fadeIn transition-all">
          <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
            <Car className="w-4 h-4 text-amber-400" />
            <span>Road Segment Info</span>
          </div>
          <div className="space-y-1 text-slate-300 font-mono text-[11px]">
            <p>Endpoints: <span className="text-slate-100">{hoveredEdge.u} ↔ {hoveredEdge.v}</span></p>
            <p>Base Distance: <span className="text-slate-100">{hoveredEdge.distance} km</span></p>
            <p>Traffic Congestion: <span className="text-amber-400 font-bold">{hoveredEdge.traffic}x</span></p>
            <p>Hazard Multiplier: <span className="text-rose-400 font-bold">{hoveredEdge.hazard}x</span></p>
            <p>Status: <span className={hoveredEdge.isBlocked ? 'text-red-400 font-bold' : 'text-emerald-400'}>{hoveredEdge.isBlocked ? 'CLOSED ⛔' : 'OPEN ✅'}</span></p>
            <div className="mt-1 pt-1 border-t border-slate-800 text-emerald-400 font-bold">
              Total Weight = {graph.getEdgeWeight(hoveredEdge.id) === Infinity ? '∞' : graph.getEdgeWeight(hoveredEdge.id).toFixed(1)}
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-3 right-3 flex items-center gap-3 glass-panel px-3 py-1.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Ambulance</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Hospital</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Open Set</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span> Visited</span>
      </div>
    </div>
  );
};
