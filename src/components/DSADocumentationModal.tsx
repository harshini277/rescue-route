import React from 'react';
import { X, BookOpen, Code2, Cpu, ShieldCheck } from 'lucide-react';

interface DSADocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DSADocumentationModal: React.FC<DSADocumentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl glass-panel bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                DSA Capstone Technical Specifications & Complexity Analysis
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Data structures, time/space complexity analysis, and mathematical formulations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* 1. Mathematical Formulation */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Code2 className="w-4 h-4" /> 1. Graph Model & Multi-Factor Cost Function
            </h3>
            <p className="leading-relaxed">
              The city map is modeled as a weighted directed graph <span className="font-mono text-emerald-400">G = (V, E)</span> where <span className="font-mono text-cyan-300">V</span> represents city intersections and emergency depots, and <span className="font-mono text-cyan-300">E</span> represents road segments.
            </p>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-slate-100 text-center">
              Weight(e) = Distance(e) × TrafficMultiplier(e) × HazardMultiplier(e)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-amber-400 block mb-1">Traffic Multiplier</span>
                • Normal: 1.0x<br />
                • Moderate: 1.5x<br />
                • Heavy Congestion: 2.5x
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-rose-400 block mb-1">Hazard Multiplier</span>
                • Safe: 1.0x<br />
                • Moderate Hazard: 1.8x<br />
                • Extreme Danger: 3.5x
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="font-bold text-red-500 block mb-1">Obstacles / Closures</span>
                • Complete Blockade: Weight = ∞<br />
                • Edge temporarily severed from graph adjacency list
              </div>
            </div>
          </div>

          {/* 2. Big-O Complexity Matrix Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> 2. Big-O Time & Space Complexity Matrix
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                    <th className="p-3">Algorithm</th>
                    <th className="p-3">Data Structure</th>
                    <th className="p-3">Time Complexity</th>
                    <th className="p-3">Space Complexity</th>
                    <th className="p-3">Optimality Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono text-slate-200">
                  <tr>
                    <td className="p-3 font-bold font-sans text-amber-400">Breadth-First Search (BFS)</td>
                    <td className="p-3 text-slate-400 font-sans">FIFO Queue</td>
                    <td className="p-3 text-emerald-400">O(V + E)</td>
                    <td className="p-3 text-cyan-400">O(V)</td>
                    <td className="p-3 text-rose-400 font-sans">Unweighted Only (Min Hops)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold font-sans text-blue-400">Dijkstra's Algorithm</td>
                    <td className="p-3 text-slate-400 font-sans">Binary Min-Heap Priority Queue</td>
                    <td className="p-3 text-emerald-400">O((V + E) log V)</td>
                    <td className="p-3 text-cyan-400">O(V)</td>
                    <td className="p-3 text-emerald-400 font-sans">Guaranteed Optimal (Weighted)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold font-sans text-cyan-400">A* Search (A-Star)</td>
                    <td className="p-3 text-slate-400 font-sans">Min-Heap + Euclidean Heuristic</td>
                    <td className="p-3 text-emerald-400">O((V + E) log V)</td>
                    <td className="p-3 text-cyan-400">O(V)</td>
                    <td className="p-3 text-emerald-400 font-sans">Guaranteed Optimal & Direct</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Heuristic Admissibility Proof */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 3. A* Heuristic Admissibility & Consistency
            </h3>
            <p className="leading-relaxed">
              In A* search, <span className="font-mono text-cyan-300">f(n) = g(n) + h(n)</span>, where <span className="font-mono text-amber-300">g(n)</span> is the exact accumulated weighted path cost from the source node, and <span className="font-mono text-emerald-300">h(n)</span> is the Euclidean distance heuristic scaled to the minimum road speed multiplier.
            </p>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-emerald-300 text-center">
              h(n) ≤ h*(n)  (Admissibility Condition)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Because straight-line Euclidean distance is the shortest possible physical distance between two points in 2D space, <span className="font-mono text-slate-200">h(n)</span> never overestimates the actual dynamic cost <span className="font-mono text-slate-200">h*(n)</span> required to reach the hospital. This guarantees that A* will always return the true shortest path while pruning unproductive branches.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
