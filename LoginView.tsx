import React from 'react';
import { useScheduler } from '../context/SchedulerContext';
import { ConflictGraph } from './ConflictGraph';

export function AlgorithmView() {
  const { logs, graphData } = useScheduler();

  if (!logs || logs.length === 0 || !graphData) {
    return (
      <div className="space-y-8 animate-in fade-in z-10 relative">
        <h2 className="text-3xl font-light tracking-tight text-white">Algorithm <span className="font-semibold">View</span></h2>
        <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center text-white/40 backdrop-blur-md">
          Run the scheduler engine to view DAA (DSATUR) visualization logs and graphs.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in z-10 relative pb-10">
      <header className="flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white">Algorithm <span className="font-semibold">View</span></h2>
          <p className="text-white/40 text-sm mt-1">Design and Analysis of Algorithms execution visualizer for DSATUR.</p>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {/* Graph Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col shadow-lg relative h-[500px]">
           <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/60">
             Conflict Graph
           </div>
           <ConflictGraph data={graphData!} />
        </div>

        {/* Logs Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col shadow-lg">
          <div className="p-4 border-b border-white/10 bg-black/20 shrink-0">
             <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Execution Logs</h3>
          </div>
          <div className="p-4 font-mono text-xs leading-relaxed">
            <table className="w-full text-left">
              <thead className="text-white/30 uppercase tracking-widest bg-transparent">
                <tr className="border-b border-white/10">
                  <th className="pb-3 font-medium px-2 w-16">Step</th>
                  <th className="pb-3 font-medium px-2 w-32">Action</th>
                  <th className="pb-3 font-medium px-2 w-28">Node</th>
                  <th className="pb-3 font-medium px-2 w-20">Slot</th>
                  <th className="pb-3 font-medium px-2">Details</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {logs.map(log => (
                  <tr key={log.step} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                    <td className="py-3 px-2 text-white/50">{log.step}</td>
                    <td className="py-3 px-2 text-indigo-300 group-hover:text-indigo-200 transition-colors">{log.action}</td>
                    <td className="py-3 px-2 font-semibold text-white">{log.node || '-'}</td>
                    <td className="py-3 px-2">
                      {log.colorAssigned !== null ? (
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded">
                          {log.colorAssigned}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-2 text-white/60" title={log.details}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
