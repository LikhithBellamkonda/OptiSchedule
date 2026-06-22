import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AppState, StudentEnrollment, RoomData, SchedulerConfig, Teacher, AlgorithmLog } from '../types';
import { runScheduling, calculateQualityMetrics } from '../utils/scheduler';
import Papa from 'papaparse';

interface SchedulerContextType extends AppState {
  setEnrollments: (data: StudentEnrollment[]) => void;
  setRooms: (data: RoomData[]) => void;
  setTeachers: (data: Teacher[]) => void;
  updateConfig: (config: Partial<SchedulerConfig>) => void;
  generateSchedule: () => void;
  loadSampleData: (enrollmentCsvStr: string, roomCsvStr: string) => void;
}

const defaultState: AppState = {
  enrollments: [],
  rooms: [],
  teachers: [],
  config: { days: 5, slotsPerDay: 4, maxExamsPerStudentPerDay: 2 },
  schedule: [],
  conflicts: [],
  logs: [],
  graphData: null,
  metrics: { qualityScore: 0, utilization: 0, totalExams: 0 },
};

const SchedulerContext = createContext<SchedulerContextType | undefined>(undefined);

export const SchedulerProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const setEnrollments = useCallback((enrollments: StudentEnrollment[]) => {
    setState(s => ({ ...s, enrollments }));
  }, []);

  const setRooms = useCallback((rooms: RoomData[]) => {
    setState(s => ({ ...s, rooms }));
  }, []);

  const setTeachers = useCallback((teachers: Teacher[]) => {
    setState(s => ({ ...s, teachers }));
  }, []);

  const updateConfig = useCallback((config: Partial<SchedulerConfig>) => {
    setState(s => ({ ...s, config: { ...s.config, ...config } }));
  }, []);

  const generateSchedule = useCallback(() => {
    setState(s => {
      const { schedule, conflicts, logs, graphData } = runScheduling(s.enrollments, s.rooms, s.teachers, s.config);
      const metrics = calculateQualityMetrics(schedule, s.rooms);
      return { ...s, schedule, conflicts, logs, graphData, metrics };
    });
  }, []);

  const loadSampleData = useCallback((enrollmentCsvStr: string, roomCsvStr: string) => {
    const parsedEnrollments = Papa.parse(enrollmentCsvStr, { header: true, skipEmptyLines: true });
    
    // We expect headers: StudentID, Subjects
    const enrollments: StudentEnrollment[] = (parsedEnrollments.data as any[])
      .filter(row => row.StudentID && row.Subjects)
      .map(row => ({
        studentId: row.StudentID,
        subjects: row.Subjects.split(',').map((s: string) => s.trim())
      }));

    const parsedRooms = Papa.parse(roomCsvStr, { header: true, skipEmptyLines: true });
    // Expect headers: Name, Capacity
    const rooms: RoomData[] = (parsedRooms.data as any[])
      .filter(row => row.Name && row.Capacity)
      .map((row, idx) => ({
        id: "R_" + idx, // generate id
        name: row.Name,
        capacity: parseInt(row.Capacity, 10)
      }));

    setState(s => ({ ...s, enrollments, rooms }));
  }, []);

  return (
    <SchedulerContext.Provider value={{ ...state, setEnrollments, setRooms, setTeachers, updateConfig, generateSchedule, loadSampleData }}>
      {children}
    </SchedulerContext.Provider>
  );
};

export const useScheduler = () => {
  const ctx = useContext(SchedulerContext);
  if (!ctx) throw new Error('useScheduler must be used within SchedulerProvider');
  return ctx;
};
