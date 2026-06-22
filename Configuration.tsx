export interface StudentEnrollment {
  studentId: string;
  subjects: string[];
}

export interface RoomData {
  id: string;
  name: string;
  capacity: number;
}

export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  feasibleSlots: string[]; // Format: "day-slot" (e.g., "1-2")
}

export interface ScheduledExam {
  subject: string;
  day: number;
  slot: number;
  room: RoomData | null;
  teacher: Teacher | null;
  studentCount: number;
}

export interface SchedulerConfig {
  days: number;
  slotsPerDay: number;
  maxExamsPerStudentPerDay: number;
}

export interface AlgorithmLog {
  step: number;
  action: string;
  node: string | null;
  colorAssigned: number | null;
  details: string;
}

export interface GraphData {
  nodes: { id: string; colorAssigned: number | null }[];
  edges: { source: string; target: string }[];
}

export interface AppState {
  enrollments: StudentEnrollment[];
  rooms: RoomData[];
  teachers: Teacher[];
  config: SchedulerConfig;
  schedule: ScheduledExam[];
  conflicts: string[];
  logs: AlgorithmLog[];
  graphData: GraphData | null;
  metrics: {
    qualityScore: number;
    utilization: number;
    totalExams: number;
  };
}

export interface SubjectStats {
  subject: string;
  studentCount: number;
  conflicts: number;
}

export interface StudentSchedule {
  studentId: string;
  exams: ScheduledExam[];
}
