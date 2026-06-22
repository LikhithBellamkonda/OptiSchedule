import React, { useState } from 'react';
import { SchedulerProvider } from './context/SchedulerContext';
import { Navigation } from './components/Navigation';
import { DataInput } from './components/DataInput';
import { Dashboard } from './components/Dashboard';
import { TimetableView } from './components/TimetableView';
import { AnalyticsView } from './components/AnalyticsView';
import { Configuration } from './components/Configuration';
import { ExportView } from './components/ExportView';
import { AlgorithmView } from './components/AlgorithmView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white/50">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="h-screen w-full bg-slate-950 font-sans text-white overflow-hidden relative flex selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px]"></div>
      </div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="relative z-10 flex-1 h-full p-0 flex flex-col overflow-hidden">
        <div className="w-full h-full p-4 md:p-6 pb-0 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center mb-4 shrink-0 px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-emerald-500' : user.role === 'teacher' ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
              <span className="text-sm font-medium">Hello, {user.name}</span>
              <span className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] uppercase tracking-wider font-bold text-white/50">{user.role}</span>
            </div>
            <button onClick={logout} className="text-xs text-white/40 hover:text-white transition-colors">Sign Out</button>
          </div>
          
          {activeTab === 'input' && <DataInput />}
          {activeTab === 'config' && <Configuration />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'timetable' && <TimetableView />}
          {activeTab === 'visualisation' && <AlgorithmView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'export' && <ExportView />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SchedulerProvider>
        <AppContent />
      </SchedulerProvider>
    </AuthProvider>
  );
}

