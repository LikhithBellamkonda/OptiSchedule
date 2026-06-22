import React from 'react';
import { useScheduler } from '../context/SchedulerContext';
import { Settings2, Play } from 'lucide-react';

export function Configuration() {
  const { config, updateConfig, generateSchedule, enrollments, rooms } = useScheduler();

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in z-10 relative">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white">Engine <span className="font-semibold">Configuration</span></h2>
          <p className="text-white/40 text-sm mt-1">Set parameters and generate your schedule.</p>
        </div>
        <button
          onClick={generateSchedule}
          disabled={enrollments.length === 0 || rooms.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-400 transition-colors rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4 fill-current" />
          Generate Matrix
        </button>
      </header>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <Settings2 className="w-5 h-5 text-indigo-300" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Schedule Parameters</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-300 mb-2">Number of Exam Days</label>
            <input 
              type="number" 
              min="1" max="30"
              value={config.days} 
              onChange={e => updateConfig({ days: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white appearance-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-300 mb-2">Slots Per Day</label>
            <input 
              type="number" 
              min="1" max="10"
              value={config.slotsPerDay} 
              onChange={e => updateConfig({ slotsPerDay: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white appearance-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-300 mb-2">Max Exams Per Student Per Day</label>
            <input 
              type="number" 
              min="1" max="5"
              value={config.maxExamsPerStudentPerDay} 
              onChange={e => updateConfig({ maxExamsPerStudentPerDay: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
