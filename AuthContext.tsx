import React, { useRef, useState } from 'react';
import { useScheduler } from '../context/SchedulerContext';
import { sampleEnrollmentCSV, sampleRoomsCSV } from '../utils/sampleData';
import { Upload, FileText, CheckCircle2, UserPlus, Trash2 } from 'lucide-react';
import Papa from 'papaparse';
import { Teacher } from '../types';

export function DataInput() {
  const { config, enrollments, setEnrollments, rooms, setRooms, teachers, setTeachers, loadSampleData } = useScheduler();
  const enrollmentFileRef = useRef<HTMLInputElement>(null);
  const roomFileRef = useRef<HTMLInputElement>(null);
  const teacherFileRef = useRef<HTMLInputElement>(null);

  // Standard Room State
  const [standardRooms, setStandardRooms] = useState({ small: 0, medium: 0, large: 0 });

  // Teacher Input State
  const [teacherName, setTeacherName] = useState('');
  const [teacherSubjects, setTeacherSubjects] = useState('');
  const [teacherFeasible, setTeacherFeasible] = useState('');

  const parseFeasibilityString = (input: string): string[] => {
    const clean = input.replace(/[^01]/g, '');
    if (!clean) return input.split(',').map(s => s.trim()).filter(Boolean); // Fallback to raw parsing if not binary
    
    const slots: string[] = [];
    let slotIdx = 0;
    for (let i = 0; i < clean.length; i++) {
        if (clean[i] === '1') {
            const day = Math.floor(slotIdx / config.slotsPerDay) + 1;
            const slot = (slotIdx % config.slotsPerDay) + 1;
            slots.push(`${day}-${slot}`);
        }
        slotIdx++;
    }
    return slots;
  };

  const handleEnrollmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = (results.data as any[])
          .map(row => {
            const keys = Object.keys(row);
            const studentIdKey = keys.find(k => k.toLowerCase().replace(/[^a-z]/g, '') === 'studentid') || keys[0];
            const subjectsKey = keys.find(k => k.toLowerCase().replace(/[^a-z]/g, '') === 'subjects') || keys[1];
            
            if (studentIdKey && subjectsKey && row[studentIdKey] && row[subjectsKey]) {
              return {
                studentId: String(row[studentIdKey]),
                subjects: String(row[subjectsKey]).split(',').map((s: string) => s.trim()).filter(Boolean)
              };
            }
            return null;
          })
          .filter(Boolean) as any[];
        setEnrollments(parsed);
        if (enrollmentFileRef.current) enrollmentFileRef.current.value = '';
      }
    });
  };

  const handleRoomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = (results.data as any[])
          .map((row, idx) => {
            const keys = Object.keys(row);
            const nameKey = keys.find(k => k.toLowerCase().includes('name')) || keys[0];
            const capacityKey = keys.find(k => k.toLowerCase().includes('cap')) || keys[1];
            
            if (nameKey && capacityKey && row[nameKey] && row[capacityKey]) {
              return {
                id: "R_" + idx,
                name: String(row[nameKey]),
                capacity: parseInt(String(row[capacityKey]).replace(/[^0-9]/g, ''), 10) || 0
              };
            }
            return null;
          })
          .filter(Boolean) as any[];
        setRooms(parsed);
        if (roomFileRef.current) roomFileRef.current.value = '';
      }
    });
  };

  const handleTeacherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = (results.data as any[])
          .map((row) => {
            const keys = Object.keys(row);
            const nameKey = keys.find(k => k.toLowerCase().includes('name')) || keys[0];
            const subjectsKey = keys.find(k => k.toLowerCase().includes('subject')) || keys[1];
            const availKey = keys.find(k => k.toLowerCase().includes('avail') || k.toLowerCase().includes('feas')) || keys[2];
            
            if (nameKey && subjectsKey && row[nameKey]) {
              return {
                id: `T_${Date.now()}_${Math.random()}`,
                name: String(row[nameKey]),
                subjects: String(row[subjectsKey] || '').split(',').map((s: string) => s.trim()).filter(Boolean),
                feasibleSlots: availKey ? parseFeasibilityString(String(row[availKey])) : []
              };
            }
            return null;
          })
          .filter(Boolean) as any[];
        setTeachers(parsed);
        if (teacherFileRef.current) teacherFileRef.current.value = '';
      }
    });
  };

  const generateStandardRooms = () => {
    const newRooms: typeof rooms = [];
    let idx = 1;
    for (let i = 0; i < standardRooms.small; i++) newRooms.push({ id: `R_${idx++}`, name: `Small ${i+1}`, capacity: 30 });
    for (let i = 0; i < standardRooms.medium; i++) newRooms.push({ id: `R_${idx++}`, name: `Medium ${i+1}`, capacity: 60 });
    for (let i = 0; i < standardRooms.large; i++) newRooms.push({ id: `R_${idx++}`, name: `Large ${i+1}`, capacity: 120 });
    setRooms(newRooms);
  };

  const handleAddTeacher = () => {
    if (!teacherName.trim() || !teacherSubjects.trim()) return;
    const newTeacher: Teacher = {
      id: `T_${Date.now()}`,
      name: teacherName.trim(),
      subjects: teacherSubjects.split(',').map(s => s.trim()).filter(Boolean),
      feasibleSlots: teacherFeasible ? parseFeasibilityString(teacherFeasible) : []
    };
    setTeachers([...teachers, newTeacher]);
    setTeacherName('');
    setTeacherSubjects('');
    setTeacherFeasible('');
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in z-10 relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white">Data <span className="font-semibold">Input</span></h2>
          <p className="text-white/40 text-sm mt-1">Upload enrollments, select rooms, and configure teachers.</p>
        </div>
        <button
          onClick={() => loadSampleData(sampleEnrollmentCSV, sampleRoomsCSV)}
          className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors"
        >
          Load Sample Enrollments & Rooms
        </button>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="bg-white/5 backdrop-blur-md border text-center border-white/10 p-5 rounded-2xl flex flex-col h-full">
          <div className="w-10 h-10 bg-indigo-500/20 text-indigo-300 rounded-lg flex items-center justify-center mb-3 mx-auto shadow-lg shadow-indigo-500/10">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Enrollment Data</h3>
          <p className="text-[10px] text-white/40 mb-4">CSV format: <code className="bg-white/10 px-1 py-0.5 rounded">StudentID</code>, <code className="bg-white/10 px-1 py-0.5 rounded">Subjects</code> (comma separated)</p>
          
          <div className="flex flex-col items-center justify-center gap-3 mt-auto">
            <input type="file" accept=".csv" className="hidden" ref={enrollmentFileRef} onChange={handleEnrollmentUpload} />
            <button
              onClick={() => enrollmentFileRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-400 transition-colors rounded-xl font-semibold text-xs shadow-lg shadow-indigo-500/20 text-white"
            >
              <Upload className="w-4 h-4" />
              Upload Enrollments CSV
            </button>
            {enrollments.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {enrollments.length} records loaded
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border text-center border-white/10 p-5 rounded-2xl flex flex-col h-full">
          <div className="w-10 h-10 bg-indigo-500/20 text-indigo-300 rounded-lg flex items-center justify-center mb-3 mx-auto shadow-lg shadow-indigo-500/10">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Room Configuration</h3>
          <p className="text-[10px] text-white/40 mb-3">Custom CSV (Name, Capacity) or presets.</p>
          
          <div className="flex gap-2 justify-center mb-3 text-left">
            <label className="text-[10px] text-white/60 text-center">S (30)
              <input type="number" min="0" value={standardRooms.small} onChange={e => setStandardRooms(s => ({...s, small: +e.target.value}))} className="w-full block mt-1 px-1.5 py-1 bg-white/10 border border-white/10 rounded outline-none text-white appearance-none text-center" />
            </label>
            <label className="text-[10px] text-white/60 text-center">M (60)
              <input type="number" min="0" value={standardRooms.medium} onChange={e => setStandardRooms(s => ({...s, medium: +e.target.value}))} className="w-full block mt-1 px-1.5 py-1 bg-white/10 border border-white/10 rounded outline-none text-white appearance-none text-center" />
            </label>
            <label className="text-[10px] text-white/60 text-center">L (120)
              <input type="number" min="0" value={standardRooms.large} onChange={e => setStandardRooms(s => ({...s, large: +e.target.value}))} className="w-full block mt-1 px-1.5 py-1 bg-white/10 border border-white/10 rounded outline-none text-white appearance-none text-center" />
            </label>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 mt-auto w-full">
            <div className="flex gap-2 w-full">
              <button
                onClick={generateStandardRooms}
                className="flex items-center justify-center gap-1.5 flex-1 p-2 bg-emerald-500 hover:bg-emerald-400 transition-colors rounded-xl font-semibold text-xs shadow-lg shadow-emerald-500/20 text-white"
              >
                Set Preset
              </button>
              <input type="file" accept=".csv" className="hidden" ref={roomFileRef} onChange={handleRoomUpload} />
              <button
                onClick={() => roomFileRef.current?.click()}
                className="flex items-center justify-center gap-1.5 flex-1 p-2 bg-indigo-500 hover:bg-indigo-400 transition-colors rounded-xl font-semibold text-xs shadow-lg shadow-indigo-500/20 text-white"
              >
                <Upload className="w-3 h-3" />
                CSV
              </button>
            </div>
            {rooms.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {rooms.length} rooms configured
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-300" />
              Teachers (Opt.)
            </h3>
            <div className="flex items-center gap-2">
               <input type="file" accept=".csv" className="hidden" ref={teacherFileRef} onChange={handleTeacherUpload} />
               <button
                  onClick={() => teacherFileRef.current?.click()}
                  className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 transition-colors rounded text-[10px] font-semibold border border-indigo-500/30 flex items-center gap-1"
                  title="CSV Format: Name, Subjects, Availability (e.g. 1010 or 1-1)"
                >
                  <Upload className="w-3 h-3" />
                  CSV
                </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2 mb-3">
            <input type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="Name (e.g. Dr. Smith)" className="w-full px-2 py-1.5 bg-white/10 border border-white/10 rounded-lg outline-none text-xs text-white" />
            <input type="text" value={teacherSubjects} onChange={e => setTeacherSubjects(e.target.value)} placeholder="Subjects (CS101, PHY202)" className="w-full px-2 py-1.5 bg-white/10 border border-white/10 rounded-lg outline-none text-xs text-white" />
            <div className="flex gap-2">
              <input type="text" value={teacherFeasible} onChange={e => setTeacherFeasible(e.target.value)} placeholder="Feasibility (101 or 1-1)" className="w-full px-2 py-1.5 bg-white/10 border border-white/10 rounded-lg outline-none text-xs text-white" />
              <button onClick={handleAddTeacher} className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-xs font-semibold transition-colors shrink-0">Add</button>
            </div>
          </div>

          <div className="flex-1 min-h-[100px] max-h-[120px] overflow-auto bg-slate-900/50 rounded-lg border border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                <tr>
                  <th className="p-2 font-medium text-white/60">Name</th>
                  <th className="p-2 font-medium text-white/60">Info</th>
                  <th className="p-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr><td colSpan={3} className="p-3 text-center text-white/30 text-[10px]">No teachers added</td></tr>
                ) : teachers.map(t => (
                  <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="p-2 truncate max-w-[80px]">{t.name}</td>
                    <td className="p-2">
                       <div className="text-[9px] text-indigo-300 truncate max-w-[100px]">{t.subjects.join(', ')}</div>
                       <div className="text-[9px] text-emerald-300 truncate max-w-[100px]">{t.feasibleSlots.length ? t.feasibleSlots.join(',') : 'Any'}</div>
                    </td>
                    <td className="p-2 text-right">
                      <button onClick={() => setTeachers(teachers.filter(x => x.id !== t.id))} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                    </td>
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
