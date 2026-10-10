import { Graph } from '../utils/Graph';
import type { NodeData, TerrainFeature } from '../types/graph';

export interface PresetMap {
  name: string;
  description: string;
  defaultSource: string;
  defaultTarget: string;
  graph: Graph;
  terrains: TerrainFeature[];
}

/**
 * PRESET 1: Emerald Bay Coastal City
 * Organic coastal layout with curving shoreline drive, downtown center, bay bridges, and suburban loops.
 */
export function createDowntownGridPreset(): PresetMap {
  const graph = new Graph();

  const nodes: NodeData[] = [
    // Source Hub & West Suburbs
    { id: 'depot_west', name: '🚑 Metro Emergency Hub 1', x: 90, y: 140, type: 'station' },
    { id: 'suburb_north', name: 'Pine Crest Heights', x: 180, y: 80, type: 'residential' },
    { id: 'suburb_west', name: 'Bayview Terraces', x: 120, y: 320, type: 'residential' },
    
    // Coastal Highway & Arterial Junctions
    { id: 'coast_jct_n', name: 'North Shore Expressway', x: 340, y: 110, type: 'intersection' },
    { id: 'central_plaza', name: '🏢 Civic Center Plaza', x: 360, y: 260, type: 'intersection' },
    { id: 'coast_jct_s', name: 'South Harbor Junction', x: 300, y: 440, type: 'intersection' },

    // Bay Bridges & River Crossings
    { id: 'bridge_north', name: '🌉 Emerald Bay Bridge (North)', x: 550, y: 160, type: 'intersection' },
    { id: 'bridge_south', name: '🌉 South Causeway Bridge', x: 530, y: 380, type: 'intersection' },

    // East Bank Downtown & Hospitals
    { id: 'downtown_n', name: 'Financial District Loop', x: 700, y: 140, type: 'intersection' },
    { id: 'downtown_c', name: 'Central Boulevard Hub', x: 740, y: 280, type: 'intersection' },
    { id: 'helipad_east', name: '🚁 Metro Helipad Alpha', x: 680, y: 430, type: 'helipad' },
    { id: 'hosp_general', name: '🏥 Westside Community Hospital', x: 860, y: 120, type: 'hospital' },
    { id: 'hosp_trauma', name: '🏥 St. Jude Regional Trauma Center', x: 890, y: 340, type: 'hospital' },
  ];

  nodes.forEach((n) => graph.addNode(n));

  // Organic curved edges with control points
  const edgesConfig = [
    { u: 'depot_west', v: 'suburb_north', dist: 11, cp: { x: 130, y: 90 } },
    { u: 'depot_west', v: 'suburb_west', dist: 18, cp: { x: 80, y: 230 } },
    { u: 'suburb_north', v: 'coast_jct_n', dist: 16, cp: { x: 260, y: 70 } },
    { u: 'depot_west', v: 'central_plaza', dist: 28, cp: { x: 220, y: 210 } },
    { u: 'suburb_west', v: 'central_plaza', dist: 24, cp: { x: 230, y: 310 } },
    { u: 'suburb_west', v: 'coast_jct_s', dist: 21, cp: { x: 190, y: 410 } },
    { u: 'coast_jct_n', v: 'central_plaza', dist: 15, cp: { x: 370, y: 180 } },
    { u: 'coast_jct_s', v: 'central_plaza', dist: 18, cp: { x: 320, y: 350 } },

    // Crossings to East Bank
    { u: 'coast_jct_n', v: 'bridge_north', dist: 21, cp: { x: 440, y: 120 } },
    { u: 'central_plaza', v: 'bridge_north', dist: 22, cp: { x: 460, y: 220 } },
    { u: 'central_plaza', v: 'bridge_south', dist: 21, cp: { x: 440, y: 310 } },
    { u: 'coast_jct_s', v: 'bridge_south', dist: 24, cp: { x: 410, y: 430 } },

    // East Bank Connections
    { u: 'bridge_north', v: 'downtown_n', dist: 15, cp: { x: 620, y: 130 } },
    { u: 'bridge_north', v: 'downtown_c', dist: 20, cp: { x: 640, y: 230 } },
    { u: 'bridge_south', v: 'downtown_c', dist: 21, cp: { x: 630, y: 330 } },
    { u: 'bridge_south', v: 'helipad_east', dist: 16, cp: { x: 600, y: 420 } },
    { u: 'downtown_n', v: 'hosp_general', dist: 16, cp: { x: 780, y: 100 } },
    { u: 'downtown_n', v: 'downtown_c', dist: 14, cp: { x: 730, y: 210 } },
    { u: 'downtown_c', v: 'hosp_trauma', dist: 16, cp: { x: 820, y: 300 } },
    { u: 'helipad_east', v: 'hosp_trauma', dist: 22, cp: { x: 780, y: 410 } },
    { u: 'hosp_general', v: 'hosp_trauma', dist: 22, cp: { x: 910, y: 230 } },
  ];

  edgesConfig.forEach(({ u, v, dist, cp }, idx) => {
    graph.addEdge({
      id: `bay_e_${idx + 1}`,
      u,
      v,
      isBidirectional: true,
      distance: dist,
      traffic: 1.0,
      hazard: 1.0,
      isBlocked: false,
      controlPoint: cp,
    });
  });

  // Pre-configure initial traffic jam on North Bridge
  const northBridgeEdge = graph.findEdge('coast_jct_n', 'bridge_north');
  if (northBridgeEdge) northBridgeEdge.traffic = 2.5;

  const centralBridgeEdge = graph.findEdge('central_plaza', 'bridge_north');
  if (centralBridgeEdge) centralBridgeEdge.hazard = 1.8;

  // Natural Terrain Features (Emerald Bay Water & Parks)
  const terrains: TerrainFeature[] = [
    {
      id: 'water_bay',
      type: 'bay',
      pathD: 'M 480,0 Q 520,200 470,300 Q 420,400 480,600 L 580,600 Q 520,380 570,200 Q 600,100 580,0 Z',
      fill: 'rgba(14, 116, 144, 0.25)',
      stroke: 'rgba(6, 182, 212, 0.4)',
      label: '🌊 Emerald Bay Channel',
      labelX: 510,
      labelY: 270,
    },
    {
      id: 'park_west',
      type: 'park',
      pathD: 'M 220,130 Q 280,120 300,170 Q 270,230 200,200 Z',
      fill: 'rgba(16, 185, 129, 0.12)',
      stroke: 'rgba(16, 185, 129, 0.3)',
      label: '🌲 Pineview Municipal Park',
      labelX: 240,
      labelY: 165,
    },
  ];

  return {
    name: 'Emerald Bay Coastal City (Natural Layout)',
    description: 'Organic city network with curving coastal drives, central bay water channel, and multiple bridge access routes.',
    defaultSource: 'depot_west',
    defaultTarget: 'hosp_trauma',
    graph,
    terrains,
  };
}

/**
 * PRESET 2: Metropolitan River & Ring Expressway
 * Dual river loops, curving suburban ring roads, and central emergency hubs.
 */
export function createArterialHighwayPreset(): PresetMap {
  const graph = new Graph();

  const nodes: NodeData[] = [
    { id: 'west_station', name: '🚑 Westside Rescue Depot', x: 100, y: 260, type: 'station' },
    { id: 'ring_nw', name: 'Northwest Ring Interchange', x: 260, y: 110, type: 'intersection' },
    { id: 'ring_sw', name: 'Southwest Ring Interchange', x: 250, y: 410, type: 'intersection' },
    { id: 'suburb_lakes', name: 'Lakeside Heights', x: 380, y: 250, type: 'residential' },

    // River Bridges
    { id: 'river_bridge_n', name: '🌉 Grand Suspension Bridge (North)', x: 520, y: 120, type: 'intersection' },
    { id: 'river_bridge_c', name: '🌉 Metro Express Tunnel', x: 540, y: 270, type: 'intersection' },
    { id: 'river_bridge_s', name: '🌉 South Heritage Bridge', x: 510, y: 420, type: 'intersection' },

    // East Bank Metro
    { id: 'ring_ne', name: 'Northeast Highway Junction', x: 720, y: 110, type: 'intersection' },
    { id: 'civic_center', name: '🏢 Civic Medical Hub', x: 700, y: 270, type: 'residential' },
    { id: 'ring_se', name: 'Southeast Expressway Loop', x: 730, y: 420, type: 'intersection' },
    { id: 'hosp_main', name: '🏥 Mercy Metropolitan Emergency Hospital', x: 890, y: 260, type: 'hospital' },
  ];

  nodes.forEach((n) => graph.addNode(n));

  const edgesConfig = [
    { u: 'west_station', v: 'ring_nw', dist: 18, cp: { x: 160, y: 160 } },
    { u: 'west_station', v: 'ring_sw', dist: 19, cp: { x: 150, y: 360 } },
    { u: 'west_station', v: 'suburb_lakes', dist: 28, cp: { x: 240, y: 260 } },
    { u: 'ring_nw', v: 'suburb_lakes', dist: 17, cp: { x: 330, y: 170 } },
    { u: 'ring_sw', v: 'suburb_lakes', dist: 18, cp: { x: 320, y: 340 } },

    // River Crossing Bridges
    { u: 'ring_nw', v: 'river_bridge_n', dist: 26, cp: { x: 390, y: 90 } },
    { u: 'suburb_lakes', v: 'river_bridge_c', dist: 16, cp: { x: 460, y: 260 } },
    { u: 'ring_sw', v: 'river_bridge_s', dist: 26, cp: { x: 380, y: 440 } },

    // East Side Connections
    { u: 'river_bridge_n', v: 'ring_ne', dist: 20, cp: { x: 620, y: 100 } },
    { u: 'river_bridge_c', v: 'civic_center', dist: 16, cp: { x: 620, y: 270 } },
    { u: 'river_bridge_s', v: 'ring_se', dist: 22, cp: { x: 620, y: 440 } },
    { u: 'ring_ne', v: 'civic_center', dist: 18, cp: { x: 730, y: 190 } },
    { u: 'ring_se', v: 'civic_center', dist: 17, cp: { x: 740, y: 350 } },
    { u: 'ring_ne', v: 'hosp_main', dist: 22, cp: { x: 820, y: 170 } },
    { u: 'civic_center', v: 'hosp_main', dist: 19, cp: { x: 800, y: 270 } },
    { u: 'ring_se', v: 'hosp_main', dist: 22, cp: { x: 830, y: 360 } },
  ];

  edgesConfig.forEach(({ u, v, dist, cp }, idx) => {
    graph.addEdge({
      id: `hwy_e_${idx + 1}`,
      u,
      v,
      isBidirectional: true,
      distance: dist,
      traffic: 1.0,
      hazard: 1.0,
      isBlocked: false,
      controlPoint: cp,
    });
  });

  // Default traffic on central river bridge
  const centralTunnelEdge = graph.findEdge('suburb_lakes', 'river_bridge_c');
  if (centralTunnelEdge) centralTunnelEdge.traffic = 2.5;

  const terrains: TerrainFeature[] = [
    {
      id: 'metro_river',
      type: 'river',
      pathD: 'M 460,0 Q 500,200 450,330 Q 410,450 470,600 L 530,600 Q 480,440 510,310 Q 550,180 520,0 Z',
      fill: 'rgba(59, 130, 246, 0.2)',
      stroke: 'rgba(59, 130, 246, 0.4)',
      label: '🌊 Metro River Basin',
      labelX: 470,
      labelY: 200,
    },
  ];

  return {
    name: 'Metropolitan River & Expressway (Natural Layout)',
    description: 'High-capacity ring expressway encircling a major winding river with bottleneck bridge routes.',
    defaultSource: 'west_station',
    defaultTarget: 'hosp_main',
    graph,
    terrains,
  };
}

/**
 * PRESET 3: Valley & Hillside Pass Generator
 * Serpentine mountain roads, winding pass loops, and valley trauma centers.
 */
export function createRandomCityPreset(): PresetMap {
  const graph = new Graph();
  const numNodes = 16;
  const width = 850;
  const height = 450;
  const padding = 80;

  const generatedNodes: NodeData[] = [];
  
  generatedNodes.push({
    id: 'valley_source',
    name: '🚑 Valley Emergency Hub',
    x: padding,
    y: height / 2,
    type: 'station',
  });

  generatedNodes.push({
    id: 'valley_target',
    name: '🏥 Hillside Trauma Hospital',
    x: width - padding,
    y: height / 2,
    type: 'hospital',
  });

  let attempts = 0;
  while (generatedNodes.length < numNodes && attempts < 500) {
    attempts++;
    const x = Math.round(padding + Math.random() * (width - 2 * padding));
    const y = Math.round(padding + Math.random() * (height - 2 * padding));

    const tooClose = generatedNodes.some((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 100;
    });

    if (!tooClose) {
      const id = `rand_node_${generatedNodes.length}`;
      generatedNodes.push({
        id,
        name: `Pass Sector ${generatedNodes.length}`,
        x,
        y,
        type: 'intersection',
      });
    }
  }

  generatedNodes.forEach((n) => graph.addNode(n));

  let edgeIdCounter = 1;
  const k = 3;

  for (let i = 0; i < generatedNodes.length; i++) {
    const u = generatedNodes[i];
    
    const distances = generatedNodes
      .map((v) => ({ node: v, dist: Math.sqrt((u.x - v.x) ** 2 + (u.y - v.y) ** 2) }))
      .filter((d) => d.node.id !== u.id)
      .sort((a, b) => a.dist - b.dist);

    for (let j = 0; j < Math.min(k, distances.length); j++) {
      const v = distances[j].node;
      if (!graph.findEdge(u.id, v.id)) {
        const edgeDist = Math.round(distances[j].dist * 0.1);
        // Create organic curved control point for serpentine mountain roads
        const midX = (u.x + v.x) / 2 + (Math.random() - 0.5) * 60;
        const midY = (u.y + v.y) / 2 + (Math.random() - 0.5) * 60;

        graph.addEdge({
          id: `rand_e_${edgeIdCounter++}`,
          u: u.id,
          v: v.id,
          isBidirectional: true,
          distance: edgeDist,
          traffic: Math.random() > 0.75 ? 1.5 : 1.0,
          hazard: Math.random() > 0.85 ? 1.8 : 1.0,
          isBlocked: false,
          controlPoint: { x: Math.round(midX), y: Math.round(midY) },
        });
      }
    }
  }

  const terrains: TerrainFeature[] = [
    {
      id: 'hillside_park',
      type: 'park',
      pathD: 'M 100,0 Q 400,100 800,0 L 850,0 Q 400,180 50,0 Z',
      fill: 'rgba(16, 185, 129, 0.08)',
      stroke: 'rgba(16, 185, 129, 0.2)',
      label: '⛰️ North Mountain Reserve',
      labelX: 420,
      labelY: 40,
    },
  ];

  return {
    name: 'Serpentine Valley & Mountain Passes',
    description: 'Procedurally generated serpentine road network winding through natural valley topography.',
    defaultSource: 'valley_source',
    defaultTarget: 'valley_target',
    graph,
    terrains,
  };
}
