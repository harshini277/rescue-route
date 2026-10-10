import React, { useRef, useEffect } from 'react';
import type { ExecutionStep } from '../types/graph';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface StepLogDrawerProps {
  steps: ExecutionStep[];
  currentStepIndex: number;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const StepLogDrawer: React.FC<StepLogDrawerProps> = ({
  steps,
  currentStepIndex,
  isOpen,
  onToggleOpen,
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentStepIndex, isOpen]);

  const activeStep = steps[currentStepIndex];

  return (
    <div className="w-full glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
      {/* Header Bar */}
      <div
        onClick={onToggleOpen}
        className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 cursor-pointer hover:bg-slate-850 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 tracking-wide">
            Algorithm Search Trace Log
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {steps.length} Steps Logged
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeStep && (
            <span className="text-[11px] text-slate-400 font-mono hidden md:inline truncate max-w-sm">
              Latest: {activeStep.logMessage}
            </span>
          )}
          <button className="text-slate-400 hover:text-white">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Log Terminal Body */}
      {isOpen && (
        <div className="p-4 bg-slate-950 font-mono text-xs max-h-60 overflow-y-auto space-y-1.5 divide-y divide-slate-900">
          {steps.slice(0, currentStepIndex + 1).map((step, idx) => {
            const isLatest = idx === currentStepIndex;
            return (
              <div
                key={idx}
                className={`pt-1.5 flex items-start gap-2 transition-colors ${
                  isLatest ? 'text-cyan-300 font-semibold' : 'text-slate-400'
                }`}
              >
                <span className="text-slate-600 select-none text-[10px] w-6 shrink-0 pt-0.5">
                  #{idx + 1}
                </span>
                <div className="flex-1">
                  <p className="leading-relaxed">{step.logMessage}</p>
                  {step.heuristicScores && step.currentNodeId && (
                    <span className="text-[10px] text-amber-400/80 block mt-0.5">
                      f-score breakdown: g = {step.distances[step.currentNodeId]?.toFixed(1) || '0'}, h = {(step.heuristicScores[step.currentNodeId] - (step.distances[step.currentNodeId] || 0))?.toFixed(1) || '0'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
};
