import React from 'react';
import type { AlgorithmType, AlgorithmResult } from '../types/graph';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Gauge
} from 'lucide-react';

interface ControlPanelProps {
  selectedAlgorithm: AlgorithmType;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  speed: number;
  onChangeSpeed: (newSpeed: number) => void;
  currentStepIndex: number;
  totalSteps: number;
  result: AlgorithmResult | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedAlgorithm,
  onSelectAlgorithm,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onReset,
  speed,
  onChangeSpeed,
  currentStepIndex,
  totalSteps,
  result,
}) => {
  const algorithms: { type: AlgorithmType; label: string; tag: string; desc: string }[] = [
    {
      type: 'bfs',
      label: 'Breadth-First Search',
      tag: 'BFS (Unweighted)',
      desc: 'Treats all valid roads as unit cost 1, ignoring traffic congestion.',
    },
    {
      type: 'dijkstra',
      label: "Dijkstra's Algorithm",
      tag: 'Min-Heap Priority Queue',
      desc: 'Finds optimal weighted path based on dynamic traffic and hazards.',
    },
    {
      type: 'astar',
      label: 'A* Search (A-Star)',
      tag: 'Guided Heuristic f=g+h',
      desc: 'Evaluates f(n) = g(n) + h(n) for directed, efficient target search.',
    },
  ];

  const progressPercent = totalSteps > 1 ? Math.round((currentStepIndex / (totalSteps - 1)) * 100) : 0;
  const etaMinutes = result?.found ? Math.round(result.pathCost * 1.2) : 0;

  return (
    <div className="w-full glass-panel p-4 rounded-2xl border border-slate-800 shadow-xl space-y-4">
      {/* 1. Algorithm Selection Selector Tabs */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
          Select Algorithm Engine:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {algorithms.map((algo) => {
            const isSelected = selectedAlgorithm === algo.type;
            return (
              <button
                key={algo.type}
                onClick={() => onSelectAlgorithm(algo.type)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 shadow-lg shadow-cyan-950/40 text-cyan-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs mb-1">
                  <span>{algo.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                    {algo.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {algo.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Animation Playback Controls & Speed Slider */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-md active:scale-95 ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/40'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Search</span>
              </>
            )}
          </button>

          <button
            onClick={onStepBackward}
            disabled={currentStepIndex <= 0 || isPlaying}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Step Backward"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onStepForward}
            disabled={currentStepIndex >= totalSteps - 1 || isPlaying}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            title="Reset Visualization"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300">Speed:</span>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={speed}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-cyan-400 w-8 text-right">
            {speed}x
          </span>
        </div>
      </div>

      {/* 3. Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
          <span>Search Step: {currentStepIndex + 1} / {totalSteps || 1}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4. Real-time Path Metrics Dashboard */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Dynamic Cost (W)
            </span>
            <span className="text-lg font-extrabold text-cyan-400 font-mono">
              {result.found ? result.pathCost.toFixed(1) : '∞'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Distance (km)
            </span>
            <span className="text-lg font-extrabold text-slate-200 font-mono">
              {result.found ? `${result.pathDistance.toFixed(1)}` : 'N/A'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Nodes Explored
            </span>
            <span className="text-lg font-extrabold text-amber-400 font-mono">
              {result.nodesExplored}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Est. Ambulance ETA
            </span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">
              {result.found ? `${etaMinutes} mins` : 'No Route'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
