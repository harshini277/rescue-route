export type NodeType = 'hospital' | 'station' | 'intersection' | 'residential' | 'helipad';

export interface NodeData {
  id: string;
  name: string;
  x: number;
  y: number;
  type: NodeType;
  address?: string;
}

export type TrafficLevel = 1.0 | 1.5 | 2.5; // Normal, Moderate, Heavy
export type HazardLevel = 1.0 | 1.8 | 3.5;  // Safe, Moderate Hazard, Extreme Danger

export interface EdgeData {
  id: string;
  u: string; // source node ID
  v: string; // target node ID
  isBidirectional: boolean;
  distance: number; // Euclidean or base road distance in meters / km
  traffic: TrafficLevel;
  hazard: HazardLevel;
  isBlocked: boolean; // Road closure / accident blockage
  controlPoint?: { x: number; y: number }; // Optional curve control point for realistic natural roads
}

export interface TerrainFeature {
  id: string;
  type: 'river' | 'park' | 'bay' | 'district';
  pathD: string;
  fill: string;
  stroke?: string;
  label?: string;
  labelX?: number;
  labelY?: number;
}

export type ToolMode = 
  | 'select_source' 
  | 'select_target' 
  | 'add_node' 
  | 'add_edge' 
  | 'paint_traffic' 
  | 'paint_hazard' 
  | 'paint_blockade' 
  | 'delete';

export type AlgorithmType = 'bfs' | 'dijkstra' | 'astar';

export interface ExecutionStep {
  stepIndex: number;
  type: 'visit_node' | 'examine_edge' | 'update_distance' | 'path_found' | 'no_path';
  currentNodeId: string | null;
  openSet: string[];        // Frontier / Priority Queue nodes
  closedSet: string[];      // Visited nodes
  distances: Record<string, number>;
  parent: Record<string, string | null>;
  heuristicScores?: Record<string, number>; // f(n) = g(n) + h(n) for A*
  activeEdgeId?: string | null;
  logMessage: string;
}

export interface AlgorithmResult {
  algorithm: AlgorithmType;
  algorithmName: string;
  path: string[];             // Array of node IDs from source to target
  pathEdges: string[];        // Array of edge IDs along the optimal path
  pathCost: number;           // Total dynamic weighted score
  pathDistance: number;       // Total physical distance (km/units)
  nodesExplored: number;      // Total vertices visited
  executionTimeMs: number;    // Measured runtime in milliseconds
  steps: ExecutionStep[];
  optimalityVerdict: string;
  found: boolean;
}

export interface BenchmarkComparison {
  bfs: AlgorithmResult;
  dijkstra: AlgorithmResult;
  astar: AlgorithmResult;
  winnerByCost: AlgorithmType;
  winnerByNodes: AlgorithmType;
}
