import { Graph } from '../utils/Graph';
import { PriorityQueue } from '../utils/PriorityQueue';
import type { AlgorithmResult, ExecutionStep } from '../types/graph';

export function runDijkstra(
  graph: Graph,
  sourceId: string,
  targetId: string
): AlgorithmResult {
  const startTime = performance.now();
  const steps: ExecutionStep[] = [];

  const distances: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  const parentEdge: Record<string, string | null> = {};
  const visited = new Set<string>();

  const pq = new PriorityQueue<string>();

  graph.nodes.forEach((_, id) => {
    distances[id] = Infinity;
    parent[id] = null;
    parentEdge[id] = null;
  });

  distances[sourceId] = 0;
  pq.push(sourceId, 0);

  let stepCount = 0;
  let found = false;

  steps.push({
    stepIndex: stepCount++,
    type: 'visit_node',
    currentNodeId: sourceId,
    openSet: pq.toArray(),
    closedSet: Array.from(visited),
    distances: { ...distances },
    parent: { ...parent },
    logMessage: `[Dijkstra] Priority Queue initialized with Ambulance Station (${sourceId}) at distance 0.`,
  });

  while (!pq.isEmpty()) {
    const current = pq.pop()!;

    if (visited.has(current)) continue;
    visited.add(current);

    steps.push({
      stepIndex: stepCount++,
      type: 'visit_node',
      currentNodeId: current,
      openSet: pq.toArray(),
      closedSet: Array.from(visited),
      distances: { ...distances },
      parent: { ...parent },
      logMessage: `[Dijkstra] Popped node '${current}' with minimum dynamic cost g(n) = ${distances[current].toFixed(1)}.`,
    });

    if (current === targetId) {
      found = true;
      break;
    }

    const neighbors = graph.getNeighbors(current);
    for (const { targetId: neighborId, edgeId, weight } of neighbors) {
      if (visited.has(neighborId)) continue;

      const alt = distances[current] + weight;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        parent[neighborId] = current;
        parentEdge[neighborId] = edgeId;
        pq.push(neighborId, alt);

        steps.push({
          stepIndex: stepCount++,
          type: 'update_distance',
          currentNodeId: current,
          activeEdgeId: edgeId,
          openSet: pq.toArray(),
          closedSet: Array.from(visited),
          distances: { ...distances },
          parent: { ...parent },
          logMessage: `[Dijkstra] Relaxed edge to '${neighborId}'. Updated cost g(${neighborId}) = ${alt.toFixed(1)}.`,
        });
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  const pathEdges: string[] = [];
  let pathCost = 0;
  let pathDistance = 0;

  if (found) {
    let curr: string | null = targetId;
    while (curr !== null) {
      path.unshift(curr);
      const pEdge = parentEdge[curr];
      if (pEdge) {
        pathEdges.unshift(pEdge);
        const weight = graph.getEdgeWeight(pEdge);
        const edgeObj = graph.edges.get(pEdge);
        if (edgeObj) pathDistance += edgeObj.distance;
        if (weight !== Infinity) pathCost += weight;
      }
      curr = parent[curr];
    }

    steps.push({
      stepIndex: stepCount++,
      type: 'path_found',
      currentNodeId: targetId,
      openSet: [],
      closedSet: Array.from(visited),
      distances: { ...distances },
      parent: { ...parent },
      logMessage: `[Dijkstra] Optimal path found! Dynamic Dynamic Weighted Cost = ${pathCost.toFixed(1)}, Total Distance = ${pathDistance.toFixed(1)} km.`,
    });
  } else {
    steps.push({
      stepIndex: stepCount++,
      type: 'no_path',
      currentNodeId: null,
      openSet: [],
      closedSet: Array.from(visited),
      distances: { ...distances },
      parent: { ...parent },
      logMessage: `[Dijkstra] No valid path to hospital found. Target is unreachable due to road closures.`,
    });
  }

  const endTime = performance.now();

  const verdict = found
    ? `Dijkstra guaranteed the absolute dynamic minimum cost route (Cost: ${pathCost.toFixed(1)}). By accounting for traffic jams and hazards, it successfully rerouted around congestion, though it expanded radially in all directions before focusing on the destination.`
    : `Dijkstra confirmed no valid route exists under current road blockades.`;

  return {
    algorithm: 'dijkstra',
    algorithmName: "Dijkstra's Algorithm",
    path,
    pathEdges,
    pathCost,
    pathDistance,
    nodesExplored: visited.size,
    executionTimeMs: Number((endTime - startTime).toFixed(2)),
    steps,
    optimalityVerdict: verdict,
    found,
  };
}
