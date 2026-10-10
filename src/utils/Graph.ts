import type { NodeData, EdgeData, TrafficLevel, HazardLevel } from '../types/graph';

export class Graph {
  public nodes: Map<string, NodeData> = new Map();
  public edges: Map<string, EdgeData> = new Map();
  
  // Adjacency map: nodeId -> list of outgoing edges { targetId, edgeId }
  public adjacency: Map<string, Array<{ targetId: string; edgeId: string }>> = new Map();

  constructor() {}

  public addNode(node: NodeData): void {
    this.nodes.set(node.id, node);
    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, []);
    }
  }

  public removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    this.adjacency.delete(nodeId);

    // Remove connected edges
    const edgesToRemove: string[] = [];
    this.edges.forEach((edge, edgeId) => {
      if (edge.u === nodeId || edge.v === nodeId) {
        edgesToRemove.push(edgeId);
      }
    });

    edgesToRemove.forEach((edgeId) => this.removeEdge(edgeId));
  }

  public addEdge(edge: EdgeData): void {
    this.edges.set(edge.id, edge);

    if (!this.adjacency.has(edge.u)) this.adjacency.set(edge.u, []);
    this.adjacency.get(edge.u)!.push({ targetId: edge.v, edgeId: edge.id });

    if (edge.isBidirectional) {
      if (!this.adjacency.has(edge.v)) this.adjacency.set(edge.v, []);
      this.adjacency.get(edge.v)!.push({ targetId: edge.u, edgeId: edge.id });
    }
  }

  public removeEdge(edgeId: string): void {
    const edge = this.edges.get(edgeId);
    if (!edge) return;

    this.edges.delete(edgeId);

    // Remove from u -> v
    const uNeighbors = this.adjacency.get(edge.u);
    if (uNeighbors) {
      this.adjacency.set(edge.u, uNeighbors.filter((n) => n.edgeId !== edgeId));
    }

    // Remove from v -> u
    if (edge.isBidirectional) {
      const vNeighbors = this.adjacency.get(edge.v);
      if (vNeighbors) {
        this.adjacency.set(edge.v, vNeighbors.filter((n) => n.edgeId !== edgeId));
      }
    }
  }

  /**
   * Calculates the dynamic weighted cost of an edge.
   * Multi-Factor Cost Function: Weight = Distance * TrafficMultiplier * HazardMultiplier
   * If edge is blocked, cost is Infinity.
   */
  public getEdgeWeight(edgeId: string): number {
    const edge = this.edges.get(edgeId);
    if (!edge || edge.isBlocked) return Infinity;

    return edge.distance * edge.traffic * edge.hazard;
  }

  /**
   * Returns Euclidean distance between two nodes.
   */
  public getEuclideanDistance(nodeId1: string, nodeId2: string): number {
    const n1 = this.nodes.get(nodeId1);
    const n2 = this.nodes.get(nodeId2);
    if (!n1 || !n2) return Infinity;

    const dx = n1.x - n2.x;
    const dy = n1.y - n2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public updateEdgeTraffic(edgeId: string, traffic: TrafficLevel): void {
    const edge = this.edges.get(edgeId);
    if (edge) edge.traffic = traffic;
  }

  public updateEdgeHazard(edgeId: string, hazard: HazardLevel): void {
    const edge = this.edges.get(edgeId);
    if (edge) edge.hazard = hazard;
  }

  public toggleEdgeBlockade(edgeId: string): void {
    const edge = this.edges.get(edgeId);
    if (edge) edge.isBlocked = !edge.isBlocked;
  }

  public clearAllHazards(): void {
    this.edges.forEach((edge) => {
      edge.traffic = 1.0;
      edge.hazard = 1.0;
      edge.isBlocked = false;
    });
  }

  public getNeighbors(nodeId: string): Array<{ targetId: string; edgeId: string; weight: number }> {
    const raw = this.adjacency.get(nodeId) || [];
    return raw
      .map(({ targetId, edgeId }) => ({
        targetId,
        edgeId,
        weight: this.getEdgeWeight(edgeId),
      }))
      .filter((neighbor) => neighbor.weight !== Infinity);
  }

  /**
   * Find edge between two nodes if exists
   */
  public findEdge(u: string, v: string): EdgeData | undefined {
    for (const edge of this.edges.values()) {
      if ((edge.u === u && edge.v === v) || (edge.isBidirectional && edge.u === v && edge.v === u)) {
        return edge;
      }
    }
    return undefined;
  }

  public clone(): Graph {
    const newGraph = new Graph();
    this.nodes.forEach((node) => newGraph.addNode({ ...node }));
    this.edges.forEach((edge) => newGraph.addEdge({ ...edge }));
    return newGraph;
  }
}
