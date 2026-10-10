import { Graph } from '../utils/Graph';
import { runBFS } from './bfs';
import { runDijkstra } from './dijkstra';
import { runAStar } from './astar';
import type { BenchmarkComparison, AlgorithmType } from '../types/graph';

export function runBenchmark(
  graph: Graph,
  sourceId: string,
  targetId: string
): BenchmarkComparison {
  const bfs = runBFS(graph, sourceId, targetId);
  const dijkstra = runDijkstra(graph, sourceId, targetId);
  const astar = runAStar(graph, sourceId, targetId);

  let winnerByCost: AlgorithmType = 'astar';
  if (dijkstra.found && astar.found) {
    if (dijkstra.pathCost < astar.pathCost - 0.01) {
      winnerByCost = 'dijkstra';
    } else {
      winnerByCost = 'astar';
    }
  } else if (bfs.found && !dijkstra.found && !astar.found) {
    winnerByCost = 'bfs';
  }

  let winnerByNodes: AlgorithmType = 'astar';
  const nodeCounts = [
    { algo: 'bfs' as AlgorithmType, count: bfs.nodesExplored },
    { algo: 'dijkstra' as AlgorithmType, count: dijkstra.nodesExplored },
    { algo: 'astar' as AlgorithmType, count: astar.nodesExplored },
  ];
  nodeCounts.sort((a, b) => a.count - b.count);
  winnerByNodes = nodeCounts[0].algo;

  return {
    bfs,
    dijkstra,
    astar,
    winnerByCost,
    winnerByNodes,
  };
}

export function runAlgorithm(
  type: AlgorithmType,
  graph: Graph,
  sourceId: string,
  targetId: string
) {
  switch (type) {
    case 'bfs':
      return runBFS(graph, sourceId, targetId);
    case 'dijkstra':
      return runDijkstra(graph, sourceId, targetId);
    case 'astar':
      return runAStar(graph, sourceId, targetId);
  }
}
