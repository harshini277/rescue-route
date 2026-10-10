import React from 'react';
import { Ambulance, RefreshCw, Layers, BookOpen, BarChart2 } from 'lucide-react';

interface HeaderProps {
  currentPreset: string;
  onSelectPreset: (presetKey: string) => void;
  onOpenBenchmark: () => void;
  onOpenDSADocs: () => void;
  onResetGraph: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  onOpenBenchmark,
  onOpenDSADocs,
  onResetGraph,
}) => {
  return (
    <header className="w-full glass-panel border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 shadow-xl">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-900/40 animate-siren">
          <Ambulance className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              RescueRoute <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono border border-red-500/30">DSA CAPSTONE</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            Ambulance Pathfinding Engine • BFS, Dijkstra & A* Visualizer
          </p>
        </div>
      </div>

      {/* Preset Selector & Quick Action Bar */}
      <div className="flex items-center flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-300">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-400 hidden md:inline">Preset Map:</span>
          <select
            value={currentPreset}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
          >
            <option value="downtown" className="bg-slate-900 text-slate-200">Downtown Grid</option>
            <option value="arterial" className="bg-slate-900 text-slate-200">Arterial Highway</option>
            <option value="random" className="bg-slate-900 text-slate-200">Random City Generator</option>
          </select>
        </div>

        <button
          onClick={onOpenBenchmark}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition-all cursor-pointer active:scale-95"
        >
          <BarChart2 className="w-4 h-4 text-white" />
          <span>Benchmark Compare All</span>
        </button>

        <button
          onClick={onOpenDSADocs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          title="View Big-O Complexity & DSA Specifications"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">DSA Specs</span>
        </button>

        <button
          onClick={onResetGraph}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          title="Reset Graph Hazards & Path State"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
