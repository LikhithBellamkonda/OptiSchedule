import React from 'react';
import { useScheduler } from '../context/SchedulerContext';
import { useAuth } from '../context/AuthContext';

export function TimetableView() {
  const { schedule, config, enrollments } = useScheduler();
  const { user } = useAuth();

  if (schedule.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in z-10 relative">
        <h2 className="text-3xl font-light tracking-tight text-white">Timetable <span className="font-semibold">View</span></h2>
        <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center text-white/40 backdrop-blur-md">
          No schedule generated yet.
        </div>
      </div>
    );
  }

  // Filter schedule based on role
  let viewableSchedule = schedule;
  if (user?.role === 'teacher') {
     viewableSchedule = schedule.filter(ex => ex.teacher?.name === user.name);
  } else if (user?.role === 'student') {
     // Find subjects this student is enrolled in
     const studentId = user.name;
     const studentEnrollment = enrollments.find(e => e.studentId === studentId);
     const studentSubjects = studentEnrollment ? studentEnrollment.subjects : [];
     viewableSchedule = schedule.filter(ex => studentSubjects.includes(ex.subject));
  }

  // Create grid Day x Slot
  const grid: { [key: string]: typeof schedule } = {};
  for (let d = 1; d <= config.days; d++) {
    for (let s = 1; s <= config.slotsPerDay; s++) {
      grid[d + "-" + s] = [];
    }
  }

  viewableSchedule.forEach(ex => {
    const key = ex.day + "-" + ex.slot;
    if (!grid[key]) grid[key] = [];
    grid[key].push(ex);
  });

  return (
    <div className="space-y-4 animate-in fade-in z-10 relative flex flex-col flex-1 pb-4">
      <header className="flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white">Timetable <span className="font-semibold">View</span></h2>
          <p className="text-white/40 text-sm mt-1">Grid view of the generated schedule{user?.role === 'student' || user?.role === 'teacher' ? ' (Filtered for you)' : ''}.</p>
        </div>
      </header>

      <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-left">
            <thead className="text-[11px] text-white/30 uppercase tracking-widest sticky top-0 bg-slate-950/80 backdrop-blur z-10">
              <tr className="border-b border-white/10">
                <th className="pb-4 font-medium whitespace-nowrap min-w-[100px]">Day \\ Slot</th>
                {Array.from({ length: config.slotsPerDay }).map((_, i) => (
                  <th key={i} className="pb-4 px-4 font-medium">Slot {i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {Array.from({ length: config.days }).map((_, dayIdx) => {
                const day = dayIdx + 1;
                return (
                  <tr key={day} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4 font-mono text-indigo-300 font-bold whitespace-nowrap align-top pt-6">Day {day}</td>
                    {Array.from({ length: config.slotsPerDay }).map((_, slotIdx) => {
                      const slot = slotIdx + 1;
                      const exams = grid[day + "-" + slot] || [];
                      return (
                        <td key={slot} className="p-4 align-top min-w-[220px]">
                          <div className="flex flex-col gap-2">
                            {exams.map(ex => (
                              <div key={ex.subject} className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
                                <div className="font-semibold text-white">{ex.subject}</div>
                                {ex.teacher && (
                                  <div className="text-[10px] text-emerald-400 font-medium mt-1 uppercase tracking-wider">
                                    {ex.teacher.name}
                                  </div>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[10px] rounded uppercase tracking-wider font-bold">
                                    {ex.room ? ex.room.name : 'No Room'}
                                  </span>
                                  <span className="text-[10px] text-white/40">{ex.studentCount} students</span>
                                </div>
                              </div>
                            ))}
                            {exams.length === 0 && (
                              <div className="h-full min-h-[60px] border border-white/5 border-dashed rounded-xl flex items-center justify-center">
                                <span className="text-[10px] text-white/20 uppercase tracking-widest">Empty</span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
