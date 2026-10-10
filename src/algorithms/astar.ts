import { Graph } from '../utils/Graph';
import { PriorityQueue } from '../utils/PriorityQueue';
import type { AlgorithmResult, ExecutionStep } from '../types/graph';

export function runAStar(
  graph: Graph,
  sourceId: string,
  targetId: string
): AlgorithmResult {
  const startTime = performance.now();
  const steps: ExecutionStep[] = [];

  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  const parentEdge: Record<string, string | null> = {};
  const visited = new Set<string>();

  const pq = new PriorityQueue<string>();

  graph.nodes.forEach((_, id) => {
    gScore[id] = Infinity;
    fScore[id] = Infinity;
    parent[id] = null;
    parentEdge[id] = null;
  });

  const calculateHeuristic = (nodeId: string): number => {
    const rawDist = graph.getEuclideanDistance(nodeId, targetId);
    return rawDist * 0.1;
  };

  gScore[sourceId] = 0;
  fScore[sourceId] = calculateHeuristic(sourceId);
  pq.push(sourceId, fScore[sourceId]);

  let stepCount = 0;
  let found = false;

  steps.push({
    stepIndex: stepCount++,
    type: 'visit_node',
    currentNodeId: sourceId,
    openSet: pq.toArray(),
    closedSet: Array.from(visited),
    distances: { ...gScore },
    heuristicScores: { ...fScore },
    parent: { ...parent },
    logMessage: `[A* Search] Initialized with source (${sourceId}). f(start) = g(0) + h(${fScore[sourceId].toFixed(1)}) = ${fScore[sourceId].toFixed(1)}.`,
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
      distances: { ...gScore },
      heuristicScores: { ...fScore },
      parent: { ...parent },
      logMessage: `[A* Search] Selected node '${current}' with minimum f(n) = g(${gScore[current].toFixed(1)}) + h(${(fScore[current] - gScore[current]).toFixed(1)}) = ${fScore[current].toFixed(1)}.`,
    });

    if (current === targetId) {
      found = true;
      break;
    }

    const neighbors = graph.getNeighbors(current);
    for (const { targetId: neighborId, edgeId, weight } of neighbors) {
      if (visited.has(neighborId)) continue;

      const tentativeG = gScore[current] + weight;
      if (tentativeG < gScore[neighborId]) {
        parent[neighborId] = current;
        parentEdge[neighborId] = edgeId;
        gScore[neighborId] = tentativeG;
        const h = calculateHeuristic(neighborId);
        fScore[neighborId] = tentativeG + h;

        pq.push(neighborId, fScore[neighborId]);

        steps.push({
          stepIndex: stepCount++,
          type: 'update_distance',
          currentNodeId: current,
          activeEdgeId: edgeId,
          openSet: pq.toArray(),
          closedSet: Array.from(visited),
          distances: { ...gScore },
          heuristicScores: { ...fScore },
          parent: { ...parent },
          logMessage: `[A* Search] Evaluated '${neighborId}': g = ${tentativeG.toFixed(1)}, h = ${h.toFixed(1)} => f = ${fScore[neighborId].toFixed(1)}.`,
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
      distances: { ...gScore },
      heuristicScores: { ...fScore },
      parent: { ...parent },
      logMessage: `[A* Search] Target hospital reached! Dynamic path cost = ${pathCost.toFixed(1)}, Total distance = ${pathDistance.toFixed(1)} km.`,
    });
  } else {
    steps.push({
      stepIndex: stepCount++,
      type: 'no_path',
      currentNodeId: null,
      openSet: [],
      closedSet: Array.from(visited),
      distances: { ...gScore },
      heuristicScores: { ...fScore },
      parent: { ...parent },
      logMessage: `[A* Search] Target hospital unreachable.`,
    });
  }

  const endTime = performance.now();

  const verdict = found
    ? `A* Search achieved the optimal path (Cost: ${pathCost.toFixed(1)}) while exploring only ${visited.size} nodes. The Euclidean heuristic h(n) guided the search directly toward the target hospital, avoiding Dijkstra's redundant backwards/radial search branches.`
    : `A* confirmed no valid route exists.`;

  return {
    algorithm: 'astar',
    algorithmName: 'A* Search (A-Star)',
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
