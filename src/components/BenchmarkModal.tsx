import React from 'react';
import type { BenchmarkComparison, AlgorithmResult } from '../types/graph';
import { 
  X, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  BarChart3
} from 'lucide-react';

interface BenchmarkModalProps {
  benchmarkData: BenchmarkComparison | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectAlgorithmToView: (algo: 'bfs' | 'dijkstra' | 'astar') => void;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({
  benchmarkData,
  isOpen,
  onClose,
  onSelectAlgorithmToView,
}) => {
  if (!isOpen || !benchmarkData) return null;

  const { bfs, dijkstra, astar, winnerByCost, winnerByNodes } = benchmarkData;
  const results: AlgorithmResult[] = [bfs, dijkstra, astar];

  const maxNodes = Math.max(bfs.nodesExplored, dijkstra.nodesExplored, astar.nodesExplored) || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl glass-panel bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Multi-Algorithm Performance Benchmark
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Comparative analysis of BFS, Dijkstra & A* on current city road conditions
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Winner Banner Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Optimal Cost Winner */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 flex items-start gap-3 shadow-lg">
              <Trophy className="w-8 h-8 text-emerald-400 shrink-0 mt-1" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  Optimal Route Winner
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  {benchmarkData[winnerByCost]?.algorithmName}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Achieved the lowest dynamic dynamic weighted cost score (Cost: <span className="text-emerald-400 font-mono font-bold">{benchmarkData[winnerByCost]?.pathCost.toFixed(1)}</span>).
                </p>
              </div>
            </div>

            {/* Efficiency Winner */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-500/40 flex items-start gap-3 shadow-lg">
              <Zap className="w-8 h-8 text-cyan-400 shrink-0 mt-1" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                  Search Efficiency Winner
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  {benchmarkData[winnerByNodes]?.algorithmName}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Evaluated the fewest total graph vertices (<span className="text-cyan-400 font-mono font-bold">{benchmarkData[winnerByNodes]?.nodesExplored} nodes</span>) before reaching target.
                </p>
              </div>
            </div>
          </div>

          {/* Benchmark Live Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                  <th className="p-3">Algorithm</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Path Cost (W)</th>
                  <th className="p-3 text-right">Distance (km)</th>
                  <th className="p-3 text-right">Nodes Explored</th>
                  <th className="p-3 text-right">Runtime (ms)</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono text-slate-200">
                {results.map((res) => {
                  const isCostWinner = winnerByCost === res.algorithm;
                  const isNodeWinner = winnerByNodes === res.algorithm;

                  return (
                    <tr
                      key={res.algorithm}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-3 font-bold font-sans flex items-center gap-2">
                        <span className="text-slate-100">{res.algorithmName}</span>
                        {isCostWinner && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-emerald-500/30">
                            BEST ROUTE
                          </span>
                        )}
                        {isNodeWinner && (
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono border border-cyan-500/30">
                            FASTEST SEARCH
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {res.found ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-sans font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-sans font-bold">
                            <XCircle className="w-3.5 h-3.5" /> No Route
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        {res.found ? res.pathCost.toFixed(1) : '∞'}
                      </td>
                      <td className="p-3 text-right text-slate-300">
                        {res.found ? `${res.pathDistance.toFixed(1)} km` : 'N/A'}
                      </td>
                      <td className="p-3 text-right text-amber-400 font-bold">
                        {res.nodesExplored}
                      </td>
                      <td className="p-3 text-right text-cyan-400">
                        {res.executionTimeMs} ms
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            onSelectAlgorithmToView(res.algorithm);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-sans font-medium transition-colors cursor-pointer"
                        >
                          Visualize
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Visual Bar Comparisons */}
          <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Search Efficiency Comparison (Nodes Explored)
            </h4>
            <div className="space-y-3">
              {results.map((res) => {
                const percent = Math.round((res.nodesExplored / maxNodes) * 100);
                return (
                  <div key={res.algorithm} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>{res.algorithmName}</span>
                      <span className="font-mono text-slate-200">{res.nodesExplored} nodes ({percent}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          res.algorithm === 'astar'
                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                            : res.algorithm === 'dijkstra'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Optimality Verdict Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Algorithmic Optimality Verdicts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {results.map((res) => (
                <div
                  key={res.algorithm}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="text-white">{res.algorithmName}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {res.optimalityVerdict}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Benchmark
          </button>
        </div>
      </div>
    </div>
  );
};
