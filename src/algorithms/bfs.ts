import { Graph } from '../utils/Graph';
import type { AlgorithmResult, ExecutionStep } from '../types/graph';

export function runBFS(
  graph: Graph,
  sourceId: string,
  targetId: string
): AlgorithmResult {
  const startTime = performance.now();
  const steps: ExecutionStep[] = [];

  const visited = new Set<string>();
  const parent: Record<string, string | null> = {};
  const queue: string[] = [];
  const parentEdge: Record<string, string | null> = {};

  const distances: Record<string, number> = {};
  graph.nodes.forEach((_, id) => {
    distances[id] = Infinity;
  });

  distances[sourceId] = 0;
  parent[sourceId] = null;
  parentEdge[sourceId] = null;

  queue.push(sourceId);
  visited.add(sourceId);

  let stepCount = 0;

  steps.push({
    stepIndex: stepCount++,
    type: 'visit_node',
    currentNodeId: sourceId,
    openSet: [...queue],
    closedSet: Array.from(visited),
    distances: { ...distances },
    parent: { ...parent },
    logMessage: `[BFS] Initiated search from Ambulance Station (${sourceId}). Enqueued starting node.`,
  });

  let found = false;

  while (queue.length > 0) {
    const current = queue.shift()!;

    steps.push({
      stepIndex: stepCount++,
      type: 'visit_node',
      currentNodeId: current,
      openSet: [...queue],
      closedSet: Array.from(visited),
      distances: { ...distances },
      parent: { ...parent },
      logMessage: `[BFS] Dequeued node '${current}'. Inspecting connected street connections.`,
    });

    if (current === targetId) {
      found = true;
      break;
    }

    const neighbors = graph.getNeighbors(current);
    for (const { targetId: neighborId, edgeId } of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        parent[neighborId] = current;
        parentEdge[neighborId] = edgeId;
        distances[neighborId] = distances[current] + 1;
        queue.push(neighborId);

        steps.push({
          stepIndex: stepCount++,
          type: 'examine_edge',
          currentNodeId: current,
          activeEdgeId: edgeId,
          openSet: [...queue],
          closedSet: Array.from(visited),
          distances: { ...distances },
          parent: { ...parent },
          logMessage: `[BFS] Discovered unvisited node '${neighborId}' via edge '${edgeId}'. Enqueued node.`,
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
      logMessage: `[BFS] Target reached! Reconstructed path with ${path.length - 1} hops. Total weighted dynamic cost: ${pathCost.toFixed(1)}.`,
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
      logMessage: `[BFS] No valid path found. All reachable routes are blocked.`,
    });
  }

  const endTime = performance.now();

  const verdict = found
    ? `BFS ignores traffic congestion and hazard multipliers, finding a path based strictly on minimum number of intersection hops (${path.length - 1} hops). This can result in sending ambulances directly through heavy traffic or hazards if they offer fewer physical turns.`
    : `BFS failed to find a path because all unblocked connections are disconnected.`;

  return {
    algorithm: 'bfs',
    algorithmName: 'Breadth-First Search (BFS)',
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
