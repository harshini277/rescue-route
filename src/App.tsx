import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Graph } from './utils/Graph';
import type { ToolMode, AlgorithmType, AlgorithmResult, ExecutionStep, BenchmarkComparison, TerrainFeature } from './types/graph';
import { 
  createDowntownGridPreset, 
  createArterialHighwayPreset, 
  createRandomCityPreset 
} from './presets/mapPresets';
import type { PresetMap } from './presets/mapPresets';
import { runAlgorithm, runBenchmark } from './algorithms/benchmark';

import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { MapCanvas } from './components/MapCanvas';
import { ControlPanel } from './components/ControlPanel';
import { StepLogDrawer } from './components/StepLogDrawer';
import { BenchmarkModal } from './components/BenchmarkModal';
import { DSADocumentationModal } from './components/DSADocumentationModal';

export default function App() {
  // Preset Selection & Terrain State
  const [currentPresetKey, setCurrentPresetKey] = useState<string>('downtown');
  const [graph, setGraph] = useState<Graph>(() => createDowntownGridPreset().graph);
  const [terrains, setTerrains] = useState<TerrainFeature[]>(() => createDowntownGridPreset().terrains);
  const [sourceNodeId, setSourceNodeId] = useState<string>(() => createDowntownGridPreset().defaultSource);
  const [targetNodeId, setTargetNodeId] = useState<string>(() => createDowntownGridPreset().defaultTarget);

  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<ToolMode | 'inspect'>('inspect');

  // Algorithm & Animation State
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('astar');
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(2.0);
  const [algorithmResult, setAlgorithmResult] = useState<AlgorithmResult | null>(null);

  // Modals & Drawers
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState<boolean>(false);
  const [isDSADocsOpen, setIsDSADocsOpen] = useState<boolean>(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState<boolean>(true);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkComparison | null>(null);

  const animationTimerRef = useRef<number | null>(null);

  // 1. Recalculate / Rerun Algorithm whenever Graph, Source, Target, or Algorithm selection changes
  const computeAlgorithm = useCallback(() => {
    if (!graph.nodes.has(sourceNodeId) || !graph.nodes.has(targetNodeId)) return;

    const result = runAlgorithm(selectedAlgorithm, graph, sourceNodeId, targetNodeId);
    setAlgorithmResult(result);
    setSteps(result.steps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [graph, sourceNodeId, targetNodeId, selectedAlgorithm]);

  useEffect(() => {
    computeAlgorithm();
  }, [computeAlgorithm]);

  // 2. Load Map Presets
  const handleSelectPreset = (presetKey: string) => {
    setCurrentPresetKey(presetKey);
    let preset: PresetMap;

    if (presetKey === 'arterial') {
      preset = createArterialHighwayPreset();
    } else if (presetKey === 'random') {
      preset = createRandomCityPreset();
    } else {
      preset = createDowntownGridPreset();
    }

    setGraph(preset.graph);
    setTerrains(preset.terrains);
    setSourceNodeId(preset.defaultSource);
    setTargetNodeId(preset.defaultTarget);
  };

  // 3. Animation Loop Timer
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(20, Math.round(500 / speed));
      animationTimerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            if (algorithmResult?.found) {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
              });
            }
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else if (animationTimerRef.current !== null) {
      clearInterval(animationTimerRef.current);
    }

    return () => {
      if (animationTimerRef.current !== null) clearInterval(animationTimerRef.current);
    };
  }, [isPlaying, speed, steps.length, algorithmResult]);

  // 4. Map Click & Interaction Handlers
  const handleSelectNode = (nodeId: string) => {
    if (activeTool === 'select_source') {
      if (nodeId !== targetNodeId) {
        setSourceNodeId(nodeId);
      }
    } else if (activeTool === 'select_target') {
      if (nodeId !== sourceNodeId) {
        setTargetNodeId(nodeId);
      }
    }
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (activeTool === 'add_node') {
      const newGraph = graph.clone();
      const newNodeId = `user_node_${Date.now()}`;
      newGraph.addNode({
        id: newNodeId,
        name: `Junction ${newGraph.nodes.size + 1}`,
        x,
        y,
        type: 'intersection',
      });

      const allNodes = Array.from(newGraph.nodes.values()).filter((n) => n.id !== newNodeId);
      const sorted = allNodes
        .map((n) => ({ node: n, dist: Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2) }))
        .sort((a, b) => a.dist - b.dist);

      for (let i = 0; i < Math.min(2, sorted.length); i++) {
        const target = sorted[i].node;
        const dist = Math.round(sorted[i].dist * 0.1);
        const midX = (x + target.x) / 2 + (Math.random() - 0.5) * 30;
        const midY = (y + target.y) / 2 + (Math.random() - 0.5) * 30;

        newGraph.addEdge({
          id: `user_e_${Date.now()}_${i}`,
          u: newNodeId,
          v: target.id,
          isBidirectional: true,
          distance: dist,
          traffic: 1.0,
          hazard: 1.0,
          isBlocked: false,
          controlPoint: { x: Math.round(midX), y: Math.round(midY) },
        });
      }

      setGraph(newGraph);
    }
  };

  const handleEdgeClick = (edgeId: string) => {
    const newGraph = graph.clone();
    const edge = newGraph.edges.get(edgeId);
    if (!edge) return;

    if (activeTool === 'paint_traffic') {
      if (edge.traffic === 1.0) edge.traffic = 1.5;
      else if (edge.traffic === 1.5) edge.traffic = 2.5;
      else edge.traffic = 1.0;
    } else if (activeTool === 'paint_hazard') {
      if (edge.hazard === 1.0) edge.hazard = 1.8;
      else if (edge.hazard === 1.8) edge.hazard = 3.5;
      else edge.hazard = 1.0;
    } else if (activeTool === 'paint_blockade') {
      edge.isBlocked = !edge.isBlocked;
    }

    setGraph(newGraph);
  };

  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    const newGraph = graph.clone();
    const node = newGraph.nodes.get(nodeId);
    if (node) {
      node.x = x;
      node.y = y;
      newGraph.edges.forEach((edge) => {
        if (edge.u === nodeId || edge.v === nodeId) {
          const uN = newGraph.nodes.get(edge.u);
          const vN = newGraph.nodes.get(edge.v);
          if (uN && vN) {
            edge.distance = Math.round(newGraph.getEuclideanDistance(uN.id, vN.id) * 0.1);
          }
        }
      });
      setGraph(newGraph);
    }
  };

  const handleNodeDelete = (nodeId: string) => {
    if (nodeId === sourceNodeId || nodeId === targetNodeId) return;
    const newGraph = graph.clone();
    newGraph.removeNode(nodeId);
    setGraph(newGraph);
  };

  const handleClearHazards = () => {
    const newGraph = graph.clone();
    newGraph.clearAllHazards();
    setGraph(newGraph);
  };

  const handleResetGraph = () => {
    handleSelectPreset(currentPresetKey);
  };

  const handleOpenBenchmark = () => {
    const bench = runBenchmark(graph, sourceNodeId, targetNodeId);
    setBenchmarkData(bench);
    setIsBenchmarkOpen(true);
  };

  const currentStep = steps[currentStepIndex] || null;
  const isSearchComplete = currentStepIndex >= steps.length - 1;
  const finalPath = isSearchComplete && algorithmResult?.found ? algorithmResult.path : [];
  const finalPathEdges = isSearchComplete && algorithmResult?.found ? algorithmResult.pathEdges : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentPreset={currentPresetKey}
        onSelectPreset={handleSelectPreset}
        onOpenBenchmark={handleOpenBenchmark}
        onOpenDSADocs={() => setIsDSADocsOpen(true)}
        onResetGraph={handleResetGraph}
      />

      {/* Main Responsive Layout Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 space-y-4">
        {/* Interactive Map Toolbar */}
        <Toolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          onClearHazards={handleClearHazards}
          sourceNodeId={sourceNodeId}
          targetNodeId={targetNodeId}
        />

        {/* Graph Canvas & Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Main Visual SVG Graph Canvas */}
          <div className="lg:col-span-8 w-full">
            <MapCanvas
              graph={graph}
              terrains={terrains}
              sourceNodeId={sourceNodeId}
              targetNodeId={targetNodeId}
              activeTool={activeTool}
              currentStep={currentStep}
              finalPath={finalPath}
              finalPathEdges={finalPathEdges}
              onSelectNode={handleSelectNode}
              onCanvasClick={handleCanvasClick}
              onEdgeClick={handleEdgeClick}
              onNodeMove={handleNodeMove}
              onNodeDelete={handleNodeDelete}
            />
          </div>

          {/* Algorithm Controls Sidebar */}
          <div className="lg:col-span-4 w-full space-y-4">
            <ControlPanel
              selectedAlgorithm={selectedAlgorithm}
              onSelectAlgorithm={setSelectedAlgorithm}
              isPlaying={isPlaying}
              onTogglePlay={() => {
                if (currentStepIndex >= steps.length - 1) {
                  setCurrentStepIndex(0);
                }
                setIsPlaying(!isPlaying);
              }}
              onStepForward={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
              onStepBackward={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              onReset={() => {
                setIsPlaying(false);
                setCurrentStepIndex(0);
              }}
              speed={speed}
              onChangeSpeed={setSpeed}
              currentStepIndex={currentStepIndex}
              totalSteps={steps.length}
              result={algorithmResult}
            />
          </div>
        </div>

        {/* Search Step Trace Log Terminal Drawer */}
        <StepLogDrawer
          steps={steps}
          currentStepIndex={currentStepIndex}
          isOpen={isLogDrawerOpen}
          onToggleOpen={() => setIsLogDrawerOpen(!isLogDrawerOpen)}
        />
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
        RescueRoute: Ambulance Pathfinding Engine • Data Structures & Algorithms Capstone Project
      </footer>

      {/* Modals */}
      <BenchmarkModal
        benchmarkData={benchmarkData}
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        onSelectAlgorithmToView={(algo) => {
          setSelectedAlgorithm(algo);
          setIsBenchmarkOpen(false);
        }}
      />

      <DSADocumentationModal
        isOpen={isDSADocsOpen}
        onClose={() => setIsDSADocsOpen(false)}
      />
    </div>
  );
}
