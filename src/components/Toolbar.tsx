import React from 'react';
import type { ToolMode } from '../types/graph';
import { 
  Ambulance, 
  Hospital, 
  MapPin, 
  Car, 
  AlertTriangle, 
  ShieldAlert, 
  Trash2,
  Sparkles,
  MousePointer
} from 'lucide-react';

interface ToolbarProps {
  activeTool: ToolMode | 'inspect';
  onSelectTool: (tool: ToolMode | 'inspect') => void;
  onClearHazards: () => void;
  sourceNodeId: string;
  targetNodeId: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  onClearHazards,
}) => {
  const tools = [
    {
      id: 'inspect' as const,
      label: 'Inspect / Select',
      icon: MousePointer,
      color: 'hover:text-cyan-400',
      activeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
      tooltip: 'Click nodes/edges to view details or drag nodes',
    },
    {
      id: 'select_source' as ToolMode,
      label: 'Set Source (Ambulance)',
      icon: Ambulance,
      color: 'hover:text-red-400',
      activeColor: 'bg-red-500/20 text-red-400 border-red-500/50',
      tooltip: 'Click any node to spawn the Ambulance 🚑',
    },
    {
      id: 'select_target' as ToolMode,
      label: 'Set Destination (Hospital)',
      icon: Hospital,
      color: 'hover:text-emerald-400',
      activeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      tooltip: 'Click any node to set Hospital target 🏥',
    },
    {
      id: 'paint_traffic' as ToolMode,
      label: 'Add Traffic Jam',
      icon: Car,
      color: 'hover:text-amber-400',
      activeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
      tooltip: 'Click edges to cycle traffic multiplier (1.0x -> 1.5x -> 2.5x)',
    },
    {
      id: 'paint_hazard' as ToolMode,
      label: 'Add Hazard Zone',
      icon: AlertTriangle,
      color: 'hover:text-rose-400',
      activeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
      tooltip: 'Click edges to cycle hazard multiplier (1.0x -> 1.8x -> 3.5x)',
    },
    {
      id: 'paint_blockade' as ToolMode,
      label: 'Road Closure / Obstacle',
      icon: ShieldAlert,
      color: 'hover:text-orange-500',
      activeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      tooltip: 'Click edges to block or unblock road connections entirely',
    },
    {
      id: 'add_node' as ToolMode,
      label: 'Add Intersection',
      icon: MapPin,
      color: 'hover:text-blue-400',
      activeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      tooltip: 'Click canvas area to spawn a new road intersection node',
    },
    {
      id: 'delete' as ToolMode,
      label: 'Remove Node',
      icon: Trash2,
      color: 'hover:text-rose-500',
      activeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
      tooltip: 'Click node to delete it and connected edges',
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl shadow-lg">
      <div className="flex items-center flex-wrap gap-1.5">
        <span className="text-xs font-bold text-slate-400 px-2 py-1 uppercase tracking-wider hidden lg:inline">
          Map Tools:
        </span>
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isActive
                  ? t.activeColor + ' shadow-md'
                  : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:bg-slate-750 ' + t.color
              }`}
              title={t.tooltip}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onClearHazards}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-600/50 text-slate-300 hover:text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
        title="Reset traffic jams, hazards, and road blockades back to normal 1.0x"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span>Clear All Hazards</span>
      </button>
    </div>
  );
};
