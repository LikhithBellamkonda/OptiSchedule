import React from 'react';
import { LayoutDashboard, Calendar, BarChart3, Settings, Save, Upload, Network } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const { user } = useAuth();
  
  let navItems = [
    { id: 'input', label: 'Data Input', icon: Upload },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'Timetable Matrix', icon: Calendar },
    { id: 'visualisation', label: 'Algorithm View', icon: Network },
    { id: 'analytics', label: 'Analytics Hub', icon: BarChart3 },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'export', label: 'Export', icon: Save },
  ];

  if (user?.role === 'user' || user?.role === 'student' || user?.role === 'teacher') {
    navItems = navItems.filter(i => ['dashboard', 'timetable'].includes(i.id));
  }

  return (
    <aside className="relative z-10 w-64 h-full border-r border-white/10 bg-white/5 backdrop-blur-xl flex flex-col shrink-0 text-white">
      <div className="flex items-center h-20 px-6 border-b border-white/10 shrink-0 gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight text-white">ExamArch</h1>
          <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold">Scheduler Engine</p>
        </div>
      </div>
      <div className="flex flex-col gap-1 p-4 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={"flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors " + (isActive ? 'bg-white/10 border border-white/10 text-white shadow-sm' : 'text-white/50 hover:bg-white/5')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-auto p-6 border-t border-white/10">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Algorithm Engine</p>
          <p className="text-xs font-medium">DSATUR Active</p>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-400 h-full w-[88%]"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
