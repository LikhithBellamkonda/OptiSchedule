import React, { useMemo } from 'react';
import { useScheduler } from '../context/SchedulerContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export function AnalyticsView() {
  const { schedule } = useScheduler();

  const utilizationData = useMemo(() => {
    if (schedule.length === 0) return [];
    
    // Group by room to average utilization
    const roomUtil: Record<string, { total: number; count: number }> = {};
    
    schedule.forEach(ex => {
      if (ex.room) {
        if (!roomUtil[ex.room.name]) roomUtil[ex.room.name] = { total: 0, count: 0 };
        roomUtil[ex.room.name].total += (ex.studentCount / ex.room.capacity) * 100;
        roomUtil[ex.room.name].count += 1;
      }
    });

    return Object.entries(roomUtil).map(([name, data]) => ({
      name,
      utilization: Math.round(data.total / data.count)
    }));
  }, [schedule]);

  if (schedule.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6 animate-in fade-in z-10 relative">
        <h2 className="text-3xl font-light tracking-tight text-white">Analytics <span className="font-semibold">Hub</span></h2>
        <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center text-white/40 backdrop-blur-md">
          Generate schedule to see analytics.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in z-10 relative">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white">Analytics <span className="font-semibold">Hub</span></h2>
          <p className="text-white/40 text-sm mt-1">Detailed evaluation of the generated timetable.</p>
        </div>
      </header>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-6">Average Room Utilization</h3>
        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{fill: 'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: 'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}}
              />
              <Bar dataKey="utilization" radius={[4, 4, 0, 0]}>
                {utilizationData.map((entry, index) => (
                  <Cell key={"cell-" + index} fill={entry.utilization > 80 ? '#10b981' : entry.utilization > 50 ? '#818cf8' : '#312e81'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-6 justify-center text-[10px] uppercase tracking-widest text-white/50">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#10b981] rounded"></div> Optimal</div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#818cf8] rounded"></div> Sub-optimal</div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#312e81] rounded"></div> Underutilized</div>
        </div>
      </div>
    </div>
  );
}
